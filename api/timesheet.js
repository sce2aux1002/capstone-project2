const express = require('express');
const router = express.Router({mergeParams: true});
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

module.exports=router;


router.get('/', (req, res, next) => {
  db.all('SELECT * FROM Timesheet where employee_id = $employee_id', 
    {$employee_id: req.employeeId}, (err, timesheets) => {
    if (err) {
      //TODO: Additional errpr
    }           
    res.status(200).send({timesheets: timesheets });    
  });
});

router.post('/', (req, res) => {

  const newTimesheet = req.body.timesheet;
  if(!newTimesheet.hours || !newTimesheet.rate ||!newTimesheet.date) {
      return res.status(400).send();
  }
  const sql = 'INSERT INTO TIMESHEET '+
  '(hours, rate, date, employee_id) values '+
  '($hours, $rate, $date, $employee_id)';
  vals={$hours: newTimesheet.hours, 
      $rate:newTimesheet.rate, 
      $date:newTimesheet.date, 
      $employee_id: req.employeeId};

  db.run(sql,vals, function(err){
    if(err){
      next(err)
    } else {
      const rowid = this.lastID;
      db.get('SELECT * from Timesheet WHERE id =$rowid',{$rowid: rowid}, (err,timesheet)=>{
          res.status(201).send({timesheet: timesheet});
      } );
    }
  });

});

router.param('timesheetId', (req, res, next, timesheetId) => {
    const sql = 'SELECT * FROM Timesheet WHERE id = $timesheetId';
    db.get(sql, {$timesheetId: timesheetId}, (error, timesheet) => {
      if(error || !timesheet){
        return res.status(404).send();
      } 
      req.timesheetId = timesheetId;
      req.timesheet = timesheet;
      next();    
    });
  });

router.put('/:timesheetId',(req,res) => {
  const newTimesheet = req.body.timesheet;
  if(!newTimesheet.hours || !newTimesheet.rate ||!newTimesheet.date) {
      return res.status(400).send();
  }
  const sql = 'UPDATE Timesheet SET ' +
  'hours = $hours, rate = $rate, date = $date ' +
  'WHERE id = $timesheetId';

  const vals = {$hours: newTimesheet.hours, $rate: newTimesheet.rate, 
    $date: newTimesheet.date, $timesheetId: req.timesheetId};
  
  db.run(sql,vals, err => {
    if(err) { 
      // Do someting
    } 
    db.get('SELECT * from Timesheet WHERE id = $timesheetId', {$timesheetId: req.timesheetId},
    (err, timesheet) => {
      res.status(200).send({timesheet: timesheet});
    });
  });
    
});


router.delete('/:timesheetId' ,(req,res) => {
  const sql = 'DELETE from Timesheet WHERE id = $timesheetId';
  db.run(sql,{$timesheetId: req.timesheetId}, err => {
    if(err) {
      // TODO: Wierd error
    }
    res.status(204).send();
  });
});


