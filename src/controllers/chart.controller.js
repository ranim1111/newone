const mongoose = require("mongoose");
const Papa = require("papaparse");
const { StatusCodes } = require("http-status-codes");

class ChartController {
  async drawSimple(req, res) {
    const { xaxis, yaxis } = req.body;
    let bufs = [];
    let result;
    const gfs = req.app.locals.gfs;
    if (req.infos.role == "admin") {
      const file = gfs
        .find({
          _id: mongoose.Types.ObjectId(req.params.id),
        })
        .toArray((err, files) => {
          if (!files || files.length === 0) {
            return res.status(404).json({
              err: "no files exist",
            });
          }

          gfs
            .openDownloadStream(mongoose.Types.ObjectId(req.params.id))
            .on("data", (chunk) => bufs.push(chunk))
            .on("end", () => {
              const fbuf = Buffer.concat(bufs);
              result = fbuf.toString();
              const parsed = Papa.parse(result);
              return res.json(parsed);
            });
        });
    } else {
      const file = gfs
        .find({
          _id: mongoose.Types.ObjectId(req.params.id),
          "metadata.userId": req.infos.authId,
        })
        .toArray((err, files) => {
          if (!files || files.length === 0) {
            return res.status(404).json({
              err: "no files exist",
            });
          }
        });
      gfs
        .openDownloadStream(mongoose.Types.ObjectId(req.params.id))
        .on("data", (chunk) => bufs.push(chunk))
        .on("end", () => {
          const fbuf = Buffer.concat(bufs);
          result = fbuf.toString();
          const parsed = Papa.parse(result);
          if (parsed.errors.length > 0) {
            return res
              .status(StatusCodes.INTERNAL_SERVER_ERROR)
              .json({ error: parsed.errors });
          }
          const data = parsed.data;
          const x = data[0].indexOf(xaxis.replace(/(\r\n|\n|\r)/gm, ""));
          const y = data[0].indexOf(yaxis.replace(/(\r\n|\n|\r)/gm, ""));
          const dataMap = new Map();
          data.slice(1, -1)?.map((element) => {
            const elt = element[y]?.replace(/(\r\n|\n|\r)/gm, "");
            if (dataMap?.get(element[x])) {
              dataMap?.set(
                element[x],
                dataMap?.get(element[x]) + parseFloat(elt)
              );
            } else {
              dataMap?.set(element[x], parseFloat(elt));
            }
          });
          let labels = [];
          let returnedData = [];
          dataMap?.forEach((value, key) => {
            labels?.push(key);
            returnedData?.push(value);
          });
          return res
            .status(StatusCodes.OK)
            .json({ xaxis, yaxis, returnedData, labels });
        });
    }
  }
}

module.exports = new ChartController();
