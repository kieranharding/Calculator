var $jq = {}  // FIXME: This has gotten sloppy, now holding all
              // globals instead of just jquery elements

function symbolKey(e) {
  // Handle number, decimal and operator keys
  var val = String.fromCharCode(e.which)

  if (val.match(/^\d$/)) {
    typeNumber(Number(val))
  } else if (val.match(/[\/\*\-\+=]/)) {
    performOperation(val)
  } else if (val.match(/\./)) {
    typeDecimal()
  }
}

function actionKey(e) {
  // Handle non-entry keys that matter
  switch (e.which) {
    case 8:   // Backspace
    case 46:  // Delete
      clearScreen()
      break;
    case 13:  // Enter
      performOperation("=")
      break;
  }
}

function typeDecimal() {
  if ($jq.screen.text() == $jq.state.stack) {
    $jq.screen.text('0.')
    $jq.state.userValue = true
  } else {
    $jq.screen.text($jq.screen.text() + '.')
  }
  $jq.state.postDecimal = true
}

function buttonClick(e) {
  //Determine what type of button it was and delegate handling
  if (e.target.childNodes.length === 1) {
    var val = e.target.innerText
    if (val.match(/^\d$/)) { //It's a number button
      typeNumber(Number(val))
    } else if (val.match(/^C/)) { //It's a clear screen button
      //TODO: Find out the difference between C and CE
      clearScreen()
    } else if (val.match(/\./)) {
      typeDecimal()
    } else { //Only other option
      performOperation(val)
    }
  }
}

function typeNumber(num) {
  //Assumes num is actually a number (not a string).
  if (!$jq.state.userValue) {
    $jq.screen.text(num)
    $jq.state.userValue = true
  } else {
    if (!$jq.state.postDecimal) {
      $jq.screen.text(Number($jq.screen.text()) * 10 + num)
    } else {
      $jq.screen.text($jq.screen.text() + num)
    }
  }
}

function performOperation(newOperation) {
  $jq.state.postDecimal = false
  if ($jq.state.operation) {
    var x = Number($jq.screen.text())
    switch ($jq.state.operation.charCodeAt(0)) {
      case 45:
        $jq.state.stack -= x;
        break;
      case 43:
        $jq.state.stack += x;
        break;
      case 42:
      case 215:
        $jq.state.stack *= x;
        break;
      case 47:
      case 247:
        $jq.state.stack /= x;
        break;
    }
  } else {
    $jq.state.stack = Number($jq.screen.text())
  }

  $jq.screen.text($jq.state.stack)
  $jq.state.userValue = false
  $jq.state.operation = newOperation.charCodeAt(0) === 61 ? null : newOperation
}

function clearScreen() {
  $jq.screen.text(0)
  $jq.state.stack = 0
  $jq.state.operation = null
  $jq.state.postDecimal = false
}

$(function() {
  $jq.buttons = $('#button-tray')
  $jq.screen = $('#screen')
  $jq.body = $('body')

//Is the value in the screen what the user is typing?
//True on startup, after clear screen and when user is typing,
//False after an operation, which means we need a new stack and to clear the screen
  $jq.state = {
    userValue: true,
    stack: 0,
    operation: null, //Unnecessary, for clarity
    postDecimal: false
  }

  $jq.buttons.click(buttonClick)
  $jq.body.keypress(symbolKey)
  $jq.body.on('keydown', actionKey)
})
