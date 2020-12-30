const { request } = require('express');
const express = require('express');
const router = express.Router();
const menuItemRouter = require('./menuitem');
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

module.exports=router;


router.get('/', (req,res, next) => {
    db.all('SELECT * FROM Menu', (err, menus) => {
        if (err) {
            res.sendStatus(404).send({error: err});
          } else {
            res.status(200).json({menus: menus});
          }
    });
});

router.post('/', (req,res, next) => { 
    const newMenu = req.body.menu;
    if(!newMenu.title){
        res.status(400).send
    }
    db.run('INSERT into Menu (title) values ($title)', {$title: newMenu.title}, function(err) {
        if(err) {
            next(err);
        } else {
            db.get('SELECT * from Menu WHERE id=$menuId',{$menuId: this.lastID}, (err,menu) => {
                res.status(201).send({menu: menu});
            });
        }
    });

});


router.param('id', (req, res, next, menuId) =>{
    const sql =  'SELECT * FROM Menu WHERE id = $menuId';
    db.get(sql, {$menuId: menuId}, (err, menu) => {
        if(err || !menu){
            return res.status(404).send();
        }
        req.menuId= menuId;
        req.menu= menu;
        next();
    });
});

router.use('/:id/menu-items',menuItemRouter);

router.get('/:id', (req, res) => {
    res.status(200).send({menu: req.menu});
});

router.put('/:id', (req, res) => { 
    const newMenu = req.body.menu;
    if(!newMenu.title){
       return res.status(400).send();
    }
    const SQL = 'UPDATE Menu SET title=$title where id = $menuId';
    db.run(SQL, {$title: newMenu.title, $menuId: req.menuId}, err =>{
        if(err) {
            // TODO: Wierd Error

        }
        db.get('SELECT * from Menu where id=$menuId', {$menuId: req.menuId},(err,menu)=> {
            if(err) {
                //TODO: Wierd Error
            }
            res.status(200).send({menu: menu});
        });
    });
});


router.delete('/:id', (req, res) => {
    const SQLM =  'SELECT * from MenuItem where menu_id =$menuId';
    db.get(SQLM,{$menuId: req.menuId}, (err, menuItem) => {
        if(err || menuItem) {
            return res.status(400).send();
        } else {
            const SQLD = 'DELETE from Menu where id = $menuId';
            db.run(SQLD,{$menuId: req.menuId}, err => {
                if(err){
                    //TODO: Wierd error
                }
                res.status(204).send();
            });
        }
    });
});

/*
/api/menus/:menuId


PUT
Updates the menu with the specified menu ID using the information from the menu property of the request body and saves it to the database. Returns a 200 response with the updated menu on the menu property of the response body
If any required fields are missing, returns a 400 response
If a menu with the supplied menu ID doesn’t exist, returns a 404 response

DELETE
Deletes the menu with the supplied menu ID from the database if that menu has no related menu items. Returns a 204 response.
If the menu with the supplied menu ID has related menu items, returns a 400 response.
If a menu with the supplied menu ID doesn’t exist, returns a 404 response


/api/menus/:menuId/menu-items

GET
Returns a 200 response containing all saved menu items related to the menu with the supplied menu ID on the menuItems property of the response body
If a menu with the supplied menu ID doesn’t exist, returns a 404 response
POST
Creates a new menu item, related to the menu with the supplied menu ID, with the information from the menuItem property of the request body and saves it to the database. Returns a 201 response with the newly-created menu item on the menuItem property of the response body
If any required fields are missing, returns a 400 response
If a menu with the supplied menu ID doesn’t exist, returns a 404 response
/api/menus/:menuId/menu-items/:menuItemId

PUT
Updates the menu item with the specified menu item ID using the information from the menuItem property of the request body and saves it to the database. Returns a 200 response with the updated menu item on the menuItem property of the response body
If any required fields are missing, returns a 400 response
If a menu with the supplied menu ID doesn’t exist, returns a 404 response
If a menu item with the supplied menu item ID doesn’t exist, returns a 404 response
DELETE
Deletes the menu item with the supplied menu item ID from the database. Returns a 204 response.
If a menu with the supplied menu ID doesn’t exist, returns a 404 response
If a menu item with the supplied menu item ID doesn’t exist, returns a 404 response
*/