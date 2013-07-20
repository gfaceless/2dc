var Crud = require('../model/crud.js')
    , ObjectID = require('mongodb').ObjectID;

var category = new Crud({
    name: 'category',
    plName: 'categories', // colName
    model: {
        // _id: {isId:true},
        name: {type: 'string'},
        children: {type: 'array'},
        slug: ''
    },
    pathPrefix: 'manage'
});


var override = function () {
    category.create = function (req, res) {
        var content = req.body
            , self = this
            , url
            , idField = self.idField
            , name = self.name
            , parentId = content.parentId;

        delete content._id;
        delete content[idField];
        delete content.parentId;
        // sanitize here. check type etc.
        this.collection.insert(content, function (err, docs) {
            if (err) throw err;
            var _id = docs[0]._id;
            parentId = ObjectID(parentId);
            console.log(parentId, _id);
            if (!content.isRoot) {
                self.collection.update({_id: parentId}, {$push: {children: _id}}, function (err, num) {
                    if (err) throw err;
                    if (req.xhr) {
                        if (num) {
                            res.send({success: true, doc: docs[0]});
                        } else {
                            // I hope it never reaches here!
                            res.send({success: false, num: num});
                        }
                    } else {

                        url = '/' + name + '/' + docs[0][idField]
                        res.redirect(url)
                    }
                })
            } else {
                res.send({success: true, doc: docs[0]});
            }
        })
    }

    category.destroy = function (req, res) {
        var idField = this.idField
            , _id = ObjectID(req.params[idField])
            , criteria = {}
            , self = this
            , parentId = req.body.parentId;

        parentId = ObjectID(parentId);
        criteria._id = _id;

        this.collection.remove(criteria, function (err, num) {
            if (err) throw err;
            if (num) {
                self.collection.update({_id: parentId}, {$pull: {children: _id}}, function (err, num) {
                    if (err) throw err;
                    if (num) {
                        res.send({success: true, num: num});
                    } else {
                        res.send({success: false, message: 'cannot remove from parent'});
                    }
                });

            } else {
                res.send({success: false, message: 'cannot find'});
            }
        })
    }

};

if (category.initialized) {
    console.log('initialized, override directly')
    override();
} else {
    console.log('not initialized, waiting initialized event')
    category.once('initialized', override);
}


category.popularize = function () {
    var self = this;
    this.collection.findOne({isRoot: "true"}, function (err, doc) {
        if (err) throw err;
        self.doc = doc;
        console.log('just the root:', self.doc);
        self._popularize(self.doc);
    })
}

category._popularize = function (node, isLast, fn) {
    var self = this;
    if (!node || !node.children) return;
    node.children.forEach(function (childId, i, arr) {
        var tmp = !!(arr.length === i + 1) && isLast;
        self.collection.findOne({_id: childId}, function (err, doc) {
            if (err) throw err;
            if (doc) {
                node.children[i] = doc;
                self._popularize(doc, tmp);
            }
        })
    })
}


category.modify = function (req, res) {
    var self = this;
    console.log(category.doc);
    res.render('category/modify', {
        title: '编辑类别',
        doc: category.doc
    });

}

category.save = function (req, res) {

}
category.refresh = function (req, res) {
    category.popularize();
    res.redirect('back');
}

module.exports = exports = category;