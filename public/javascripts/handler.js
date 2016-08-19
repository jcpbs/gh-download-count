'use strict';

var box = document.getElementById('name');
var link = document.getElementById('namelink');
var btn = document.getElementById('go-btn');

function fetch(event) {
  event.defaultPrevented;
  var key = event.keyCode || event.which;
  if (key === 13) {
    link.href = '/q?name=' + box.value;
    link.click();
    box.value = '';
  }
}
