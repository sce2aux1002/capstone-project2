const sqlite3 = require('sqlite3');

const db = new sqlite3.Database('./database.sqlite');

const sqlEmployee = 'CREATE TABLE IF NOT EXISTS Employee (' +
    'id INTEGER PRIMARY KEY, ' +    
    'name TEXT NOT NULL, ' +
    'position TEXT NOT NULL, ' +
    'wage INTEGER NOT NULL, '+
    'is_current_employee INTEGER DEFAULT 1)';


db.run( sqlEmployee, error =>{ 
    if(error) {
        console.log(`Error: ${error}`);
    }
});


const sqlTimesheet = 'CREATE TABLE IF NOT EXISTS Timesheet (' +
'id INTEGER PRIMARY KEY, ' +
'hours INTEGER NOT NULL, '+
'rate INTEGER NOT NULL, ' +
'date INTEGER NOT NULL, ' +
'employee_id INTEGER NOT NULL, ' +
'FOREIGN KEY(employee_id) REFERENCES Employee(id))';

db.run( sqlTimesheet, error =>{ 
    if(error) {
        console.log(`Error: ${error}`);
    }
});


const sqlMenu = 'CREATE TABLE IF NOT EXISTS Menu ( ' +
'id INTEGER PRIMARY KEY, ' +
'title TEXT NOT NULL )';

db.run( sqlMenu, error =>{ 
    if(error) {
        console.log(`Error: ${error}`);
    }
});


const sqlMenuItem = 'CREATE TABLE IF NOT EXISTS MenuItem ( ' +
'id INTEGER PRIMARY KEY, ' +
'name TEXT NOT NULL, ' +
'description TEXT NOT NULL, ' +
'inventory INTEGER NOT NULL, ' +
'price INTEGER NOT NULL, ' +
'menu_id INTEGER NOT NULL, ' +
'FOREIGN KEY(menu_id) REFERENCES Menu(id))';


db.run( sqlMenuItem, error =>{ 
    if(error) {
        console.log(`Error: ${error}`);
    }
});


/*


MenuItem

id - Integer, primary key, required
name - Text, required
description - Text, optional
inventory - Integer, required
price - Integer, required
menu_id - Integer, foreign key, required
*/