const {task} = require('./helpers/task_class');
const {taskMongo} = require('./helpers/task_class_Mongo');
exports.init = (app) => {
    app.post('/api/tasks', (req, res) => {
        try {
            console.log('START');
            task.create(req.body)
            .then(() => {
                console.log('SUCCESS');
                res.send({status: true, statusText: 'Task created successfully.'});
            })
            .catch((error) => {
                console.log('ERROR: ', error.message);
                res.send({status: false, statusText: error.message});
            });
        } catch (error) {
            console.log('ERROR: ', error.message);
            res.send({status: false, statusText: error.message});
        }
    });

    app.patch('/api/tasks/', (req, res) => {
        task[req.body.action](req.body)
        .then((response) => {
            res.send({status: true, statusText: 'Task updated successfully.',data:response});
        })
        .catch((error) => {
            console.log('ERROR: ', error);
            console.error("ERRORsssss: ", error.message);
            res.send({status: false, statusText: error.message});
        });
    });

    app.post('/api/v2/tasks', (req, res) => {
        try {
            console.log('START');
            taskMongo.create(req.body)
            .then((resData) => {
                console.log('SUCCESS');
                res.send({status: true, statusText: 'Task created successfully.', id: resData.id});
            })
            .catch((error) => {
                console.log('ERROR: ', error.message);
                res.send({status: false, statusText: error.message});
            });
        } catch (error) {
            console.log('ERROR: ', error.message);
            res.send({status: false, statusText: error.message});
        }
    });

    app.patch('/api/v2/tasks/', (req, res) => {
        taskMongo[req.body.action](req.body)
        .then((response) => {
            res.send({status: true, statusText: 'Task updated successfully.',data:response});
        })
        .catch((error) => {
            console.log('ERROR: ', error);
            console.error("ERRORsssss: ", error.message);
            res.send({status: false, statusText: error.message});
        });
    });
}