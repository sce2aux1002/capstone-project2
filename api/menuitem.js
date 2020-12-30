const express = require('express');
const router = express.Router({mergeParams: true});
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

module.exports=router;

router.get('/', (req, res, next) => {
    db.all('SELECT * FROM MenuItem where menu_id = $menu_id', 
      {$menu_id: req.menuId}, (err, menuItems) => {
      if (err) {
        //TODO: Weirde errpr
      }           
      res.status(200).send({menuItems: menuItems });    
    });
  });

router.post('/', (req, res) => {
    const newMenuItem = req.body.menuItem;
    if(!newMenuItem.name || !newMenuItem.description ||
        !newMenuItem.inventory || !newMenuItem.price) {
        return res.status(400).send();
    }
    const sql = 'INSERT INTO MenuItem '+
    '(name, description, inventory, price, menu_id) values '+
    '($name, $description, $inventory, $price, $menu_id)';
    vals={$name: newMenuItem.name, 
        $description: newMenuItem.description, 
        $inventory: newMenuItem.inventory, 
        $price: newMenuItem.price, 
        $menu_id: req.menuId};
  
    db.run(sql,vals, function(err){
      if(err){
        next(err)
      } else {
        const rowid = this.lastID;
        db.get('SELECT * from MenuItem WHERE id =$rowid',{$rowid: rowid}, (err,menuItem)=>{
            res.status(201).send({menuItem: menuItem});
        } );
      }
    });
  
  });
  

router.param('menuItemId', (req, res, next, menuItemId) => {
    const sql = 'SELECT * FROM menuItem WHERE id = $menuItemId';
    db.get(sql, {$menuItemId: menuItemId}, (error, menuItem) => {
        if(error || !menuItem){
        return res.status(404).send();
        } 
        req.menuItemId = menuItemId;
        req.menuItem = menuItem;
        next();    
    });
});


router.put('/:menuItemId',(req,res) => {
    const newMenuItem = req.body.menuItem;
    if(!newMenuItem.name || !newMenuItem.description ||
        !newMenuItem.inventory || !newMenuItem.price) {
        return res.status(400).send();
    }
    const SQL = 'UPDATE MenuItem SET '+
    'name=$name, description=$description, inventory=$inventory, price=$price '+
    'where id=$menuItemId';

    vals={$name: newMenuItem.name, 
        $description: newMenuItem.description, 
        $inventory: newMenuItem.inventory, 
        $price: newMenuItem.price, 
        $menuItemId: req.menuItemId};
    
    db.run(SQL, vals, err =>{
        if(err){
            //TODO: Wierd error
        }
        db.get('SELECT * from MenuItem where id = $menuItemId', {$menuItemId: req.menuItemId},
         (err, menuItem) =>{
            if(err) {
                //TODO: Wierd error
            }
            res.status(200).send({menuItem: menuItem});
        });
    });
});


router.delete('/:menuItemId',(req,res) => {
    const SQL = 'DELETE from MenuItem where id = $menuItemId';
    db.run(SQL,{$menuItemId: req.menuItemId}, err => {
        if(err) {
            //TOOD: Weird Errof
        }
        res.status(204).send();
    });
});
/*

/api/menus/:menuId/menu-items


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