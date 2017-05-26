'use strict'

$('.bootstrap-switch-square').radiocheck()

if ($('[data-toggle="switch"]').length) {
  $('[data-toggle="switch"]').bootstrapSwitch()
}

$('.input-group').on('focus', '.form-control', function () {
  $(this).closest('.input-group, .form-group').addClass('focus')
}).on('blur', '.form-control', function () {
  $(this).closest('.input-group, .form-group').removeClass('focus')
})

const fuz = document.getElementById('fuz-checkbox')
const name = document.getElementById('name')
const link = document.getElementById('namelink')

function search (ev) {
  const key = ev.keyCode || ev.which
  if (key === 13) {
    if (fuz.checked) {
      link.href = `/q?name=${name.value}&fuz=y`
      link.click()
    } else {
      link.href = `/q?name=${name.value}&fuz=n`
      link.click()
    }
    name.value = ''
  }
}
