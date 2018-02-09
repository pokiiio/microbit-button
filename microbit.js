// 接続するBluetoothデバイス
let targetDevice = null;

// micro:bit ボタンサービス
const BUTTON_SERVICE = "e95d9882-251d-470a-a062-fa1922dfa9a8";

// micro:bit ボタンAキャラクタリスティック
const BUTTON_A_DATA = "e95dda90-251d-470a-a062-fa1922dfa9a8";

// micro:bit ボタンBキャラクタリスティック
const BUTTON_B_DATA = "e95dda91-251d-470a-a062-fa1922dfa9a8";


function onClickStartButton() {
  if (!navigator.bluetooth) {
    showModal("Web Bluetooth is not supported.")
    return;
  }

  requestDevice();
}

function onClickStopButton() {
  if (!navigator.bluetooth) {
    showModal("Web Bluetooth is not supported.")
    return;
  }

  disconnect();
}

function requestDevice() {
  navigator.bluetooth.requestDevice({
    filters: [
      { services: [BUTTON_SERVICE] },
      { namePrefix: "BBC micro:bit" }
    ]
  })
    .then(device => {
      targetDevice = device;
      connect(targetDevice);
    })
    .catch(error => {
      showModal(error);
      targetDevice = null;
    });
}

function disconnect() {
  if (targetDevice == null) {
    showModal('target device is null.');
    return;
  }

  targetDevice.gatt.disconnect();
}

function connect(device) {
  device.gatt.connect()
    .then(server => {
      findButtonService(server);
    })
    .catch(error => {
      showModal(error);
    });
}

function findButtonService(server) {
  server.getPrimaryService(BUTTON_SERVICE)
    .then(service => {
      findButtonACharacteristic(service);
      findButtonBCharacteristic(service);
    })
    .catch(error => {
      showModal(error);
    });
}

function findButtonACharacteristic(service) {
  service.getCharacteristic(BUTTON_A_DATA)
    .then(characteristic => {
      startButtonANotification(characteristic);
    })
    .catch(error => {
      showModal(error);
    });
}

function startButtonANotification(characteristic) {
  characteristic.startNotifications()
    .then(char => {
      characteristic.addEventListener('characteristicvaluechanged',
        onButtonAChanged);
    });
}

function onButtonAChanged(event) {
  let state = event.target.value.getUint8(0, true);
  updateButtonState("a_button", state);
}

function findButtonBCharacteristic(service) {
  service.getCharacteristic(BUTTON_B_DATA)
    .then(characteristic => {
      startButtonBNotification(characteristic);
    })
    .catch(error => {
      showModal(error);
    });
}

function startButtonBNotification(characteristic) {
  characteristic.startNotifications()
    .then(char => {
      characteristic.addEventListener('characteristicvaluechanged',
        onButtonBChanged);
    });
}

function onButtonBChanged(event) {
  let state = event.target.value.getUint8(0, true);
  updateButtonState("b_button", state);
}

// ボタンの状態を表示する
function updateButtonState(buttonName, state) {
  let img = document.getElementsByName(buttonName)[0];

  switch (state) {
    case 0:
      img.src = buttonName == "a_button" ? "a_normal.png" : "b_normal.png";
      break;
    case 1:
      img.src = buttonName == "a_button" ? "a_pressed.png" : "b_pressed.png";
      break;
    case 2:
      img.src = buttonName == "a_button" ? "a_pressed_long.png" : "b_pressed_long.png";
      break;
  }
}

function showModal(message) {
  document.getElementsByName("modal-message")[0].innerHTML = message;
  $("#myModal").modal("show");
}