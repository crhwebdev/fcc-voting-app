const express = require('express');

module.exports = function (app){

    app.get('/', (req, res) => {
        res.render('home');
    });

}

