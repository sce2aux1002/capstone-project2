const express = require('express');
const router = express.Router();
const timesheetRouter = require ('./timesheet');
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

module.exports=router;


router.get('/', (req,res, next) => {
    db.all('SELECT * FROM Employee WHERE is_current_employee = 1', (err, employees) => {
        if (err) {
            res.sendStatus(404).send({error: err});
          } else {
            res.status(200).json({employees: employees});
          }
    });
});

router.param('id', (req, res, next, employeeId) => {

    const sql = 'SELECT * FROM Employee WHERE Employee.id = $employeeId';
    db.get(sql, {$employeeId: employeeId}, (error, employee) => {
      if(error || !employee){
        return res.status(404).send();
      } 
      req.employeeId = employeeId;
      req.employee = employee;
      next();    
    });
  });

router.use('/:id/timesheets', timesheetRouter);

router.get('/:id', (req, res ) =>{

    res.status(200).send({employee: req.employee});
} );

router.post('/', function(req,res,next){
    const newEmployee = req.body.employee;
    if (!newEmployee.name || !newEmployee.position || !newEmployee.wage) {
      return res.status(400).send();
    }
    // Create SQL stuff
    const sql = 'INSERT INTO Employee (name, position,  wage ) values ' +
    '($name, $position, $wage);';

    const vals= {$name: newEmployee.name, 
      $position: newEmployee.position, 
      $wage: newEmployee.wage};
    // Execute SQL
      db.run(sql,vals, function(err){
        if(err){
          return res.status(400).send();
        }
        const rowid = this.lastID;
        db.get('SELECT * from Employee WHERE id = $employeeId', {$employeeId: rowid}, (err,row)=>{ 
          res.status(201).json({employee: row});
        }); // db.get
      });  // db.run
  
  });

router.put('/:id', (req,res)=>{
    const newEmployee = req.body.employee;
    if (!newEmployee.name || !newEmployee.position || !newEmployee.wage ) {
        return res.status(400).send();
    }
    // Check data for new arts
    const sql = 'UPDATE Employee SET ' + 
    'name=$name, position=$position, '+ 
    'wage=$wage WHERE id=$employeeId';

    const params= {$name: newEmployee.name, $position: newEmployee.position,
    $wage: newEmployee.wage, $employeeId: req.employeeId };

    db.run(sql,params, function(err){
        if(err){
        return res.status(400).send();
        }

        db.get('SELECT * from Employee WHERE id = $employeeId', {$employeeId: req.employeeId}, (err,row)=>{ 
        res.status(200).json({employee: row});
        }); // db.get
    });  // db.run


});

router.delete('/:id', (req, res)=>{
    const sql = 'UPDATE Employee SET is_current_employee=0 ' +
    'WHERE id=$employeeId';
    db.run(sql,{$employeeId: req.employeeId}, function(err){
      db.get('SELECT * from Employee WHERE id = $employeeId', {$employeeId: req.employeeId}, (err,row)=>{ 
        res.status(200).json({employee: row});
      }); // db.get
    });  // db.run
  
  });
   
  

