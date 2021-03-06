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
      clearEntry()
      break;
    case 46:  // Delete
      clearScreen()
      break;
    case 13:  // Enter
      performOperation("=")
      break;
  }
}

function typeDecimal() {
  if (!$jq.state.postDecimal) { //  If no decimal has been entered. Easier to just look for one?
    if (!$jq.state.userValue) {
      $jq.screen.text('0.')
      $jq.state.userValue = true
    } else {
      $jq.screen.text($jq.screen.text() + '.')
    }
    $jq.state.postDecimal = true
  }
}

function buttonClick(e) {
  //Determine what type of button it was and delegate handling
  if (e.target.childNodes.length === 1) {
    var val = e.target.innerText
    if (val.match(/^\d$/)) { //It's a number button
      typeNumber(Number(val))
    } else if (val.match(/^C$/)) { //It's a clear screen button
      clearScreen()
    } else if (val.match(/^CE$/)) { //It's a clear entry button
      clearEntry()
    } else if (val.match(/\./)) {
      typeDecimal()
    } else { //Only other option
      performOperation(val)
    }
  }
}

function operationEntered() {
  //  Was the last thing entered an operation?
  return $jq.state.stack.length ? $jq.state.stack[$jq.state.stack.length -1]
    .match(/[\/\*\-\+=]/) : false
}

function typeNumber(num) {
  // Expects a number, not a string
  // console.log($jq.state)
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
  //  If no number has been entered, the operation will be applied to zero.
  //  If the user has already done something and not cleared the screen,
  //  the operation will be applied to the answer.
  if ($jq.state.userValue || !operationEntered()) {
    $jq.state.stack.push($jq.screen.text())
    $jq.state.result = eval($jq.state.stack.join(''))
    $jq.screen.text($jq.state.result)
    if (!(newOperation === '=')) { // Still going...
      switch (newOperation.charCodeAt(0)) {
        case 45:
          $jq.state.stack.push('-')
          break;
        case 43:
          $jq.state.stack.push('+')
          break;
        case 42:
        case 215:
          $jq.state.stack.push('*')
          break;
        case 47:
        case 247:
          $jq.state.stack.push('/')
          break;
      }
    } else { // Operation is complete
      $jq.state.stack = []
    }

    //  Prepare for whatever comes next
    $jq.state.postDecimal = false
    $jq.state.userValue = false
  }
}

function clearScreen() {
  $jq.screen.text(0)
  $jq.state.stack = []
  $jq.state.postDecimal = false
  $jq.state.userValue = false
  $jq.state.result = 0
}

function clearEntry() {
  $jq.screen.text(0)
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
    stack: [],
    postDecimal: false,
    result: 0
  }

  $jq.buttons.click(buttonClick)
  $jq.body.keypress(symbolKey)
  $jq.body.on('keydown', actionKey)
})
