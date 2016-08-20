'use strict';

var box = document.getElementById('name');
var link = document.getElementById('namelink');
var btn = document.getElementById('go-btn');
var fuz = document.getElementById('fuz-checkbox');

function fetch(event) {
  event.defaultPrevented;
  var key = event.keyCode || event.which;
  if (key === 13) {
  	if (fuz.checked) {
    	link.href = `/q?name=${box.value}&fuz=y`;
    	link.click();
    	box.value = '';
    } else {
    	link.href = `/q?name=${box.value}&fuz=n`;
    	link.click();
    	box.value = '';
  	}
  }
}
