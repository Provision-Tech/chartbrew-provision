const ConnectionController = require("./ConnectionController");
const db = require("../models/models");

class RequestController {
  constructor() {
    this.connectionController = new ConnectionController();
  }

  create(data) {
    return db.DataRequest.findOne({
      where: { dataset_id: data.dataset_id },
    })
      .then((dataRequest) => {
        if (dataRequest) return this.update(dataRequest.id, data);

        return db.DataRequest.create(data);
      })
      .then((dataRequest) => {
        return this.findById(dataRequest.id);
      })
      .catch((error) => {
        return new Promise((resolve, reject) => reject(error));
      });
  }

  findById(id) {
    return db.DataRequest.findOne({
      where: { id },
      include: [{ model: db.Connection, attributes: ["id", "type"] }],
    })
      .then((dataRequest) => {
        if (!dataRequest) {
          return new Promise((resolve, reject) => reject(new Error(404)));
        }
        return new Promise((resolve) => resolve(dataRequest));
      })
      .catch((error) => {
        return new Promise((resolve, reject) => reject(error));
      });
  }

  findByChart(chartId) {
    return db.DataRequest.findOne({
      where: { chart_id: chartId },
      include: [{ model: db.Connection, attributes: ["id", "type", "host"] }]
    })
      .then((dataRequest) => {
        if (!dataRequest) {
          return new Promise((resolve, reject) => reject(new Error(404)));
        }
        return new Promise((resolve) => resolve(dataRequest));
      })
      .catch((error) => {
        return new Promise((resolve, reject) => reject(error));
      });
  }

  findByDataset(datasetId) {
    return db.DataRequest.findAll({
      where: { dataset_id: datasetId },
      include: [{ model: db.Connection, attributes: ["id", "type", "host"] }]
    })
      .then((dataRequests) => {
        if (!dataRequests || dataRequests.length === 0) {
          return new Promise((resolve, reject) => reject(new Error(404)));
        }
        return Promise.resolve(dataRequests);
      })
      .catch((error) => {
        return Promise.reject(error);
      });
  }

  update(id, data) {
    return db.DataRequest.update(data, {
      where: { id },
    })
      .then(() => {
        return this.findById(id);
      })
      .catch((error) => {
        return new Promise((resolve, reject) => reject(error));
      });
  }

  sendRequest(chartId) {
    let gDataRequest;
    return this.findByChart(chartId)
      .then((dataRequest) => {
        if (!dataRequest) return new Promise((resolve, reject) => reject(new Error(404)));
        gDataRequest = JSON.parse(JSON.stringify(dataRequest));

        return db.Chart.findByPk(chartId);
      })
      .then((chart) => {
        const jsChart = chart.get({ plain: true });
        return this.connectionController.testApiRequest({ ...jsChart, dataRequest: gDataRequest });
      })
      .catch((error) => {
        return new Promise((resolve, reject) => reject(error));
      });
  }
}

module.exports = RequestController;
