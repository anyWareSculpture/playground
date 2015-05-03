// Yes, this is actually -*-c++-*-

#include "./Timer.h"
#include "./Bounce2.h"

/*
  Serial protocol:

  INIT <name>
  STATE <state>
  DISK <disk> STATE <state>
  DISK <disk> POS <pos>

 */

// Top disk
const int DISK0_LEFT_SENSOR = A0;
const int DISK0_RIGHT_SENSOR = A5;
const int DISK0_HOME_SENSOR = A10;
const int DISK0_COUNT_SENSOR = 38;
const int DISK0_RED_PIN = 2;
const int DISK0_GREEN_PIN = 3;
const int DISK0_BLUE_PIN = 4;
const int DISK0_MOTOR_A = 22;
const int DISK0_MOTOR_B = 24;
const uint32_t DISK0_COLOR = Color(0,0,255);

// Middle disk
const int DISK1_LEFT_SENSOR = A1;
const int DISK1_RIGHT_SENSOR = A4;
const int DISK1_HOME_SENSOR = A9;
const int DISK1_COUNT_SENSOR = 34;
const int DISK1_RED_PIN = 5;
const int DISK1_GREEN_PIN = 6;
const int DISK1_BLUE_PIN = 7;
const int DISK1_MOTOR_A = 26;
const int DISK1_MOTOR_B = 28;
const uint32_t DISK1_COLOR = Color(255,255,0);

// Bottom disk
const int DISK2_LEFT_SENSOR = A2;
const int DISK2_RIGHT_SENSOR = A3;
const int DISK2_HOME_SENSOR = A8;
const int DISK2_COUNT_SENSOR = 36;
const int DISK2_RED_PIN = 11;
const int DISK2_GREEN_PIN = 12;
const int DISK2_BLUE_PIN = 13;
const int DISK2_MOTOR_A = 30;
const int DISK2_MOTOR_B = 32;
const uint32_t DISK2_COLOR = Color(255,0,255);

// Colors
uint32_t RED = Color(255,0,0);
uint32_t GREEN = Color(0,255,0);
uint32_t BLACK = Color(0,0,0);

// Globals

const int TEETH = 33;
const int REV = TEETH*2;

const int GLOBAL_STATE_OFF = 0;
const int GLOBAL_STATE_USER = 1;
const int GLOBAL_STATE_HOME = 2;
const int GLOBAL_STATE_SUCCESS = 3;

int globalState = GLOBAL_STATE_OFF;
Timer timer;
int8_t blinkerIdx = -1;
int8_t resetIdx = -1;

int combination[3] = {17,43,63};
struct Disk {
  int id;
  int leftSensor;
  int rightSensor;
  int homeSensor;
  int countSensor;
  int redPin,greenPin,bluePin;
  int motorA,motorB;
  uint32_t color;

  Bounce leftIR;
  Bounce rightIR;
  Bounce countState;
  bool countChanged;

  int magnetValue;
  int lastMagnetValue;

  int direction;
  bool moving;

  int position;
  uint32_t currColor;

  static const int STATE_OFF = 0;
  static const int STATE_USER = 1;
  static const int STATE_HOME = 2;
  int state;

  Disk(int diskid,
       int ls, int rs, int hs, int cs,
       int r, int g, int b,
       int ma, int mb, uint32_t color) :
    id(diskid), 
    leftSensor(ls), rightSensor(rs), homeSensor(hs), countSensor(cs),
    redPin(r), greenPin(g), bluePin(b), 
    motorA(ma), motorB(mb), color(color), 
    moving(false), state(STATE_OFF), currColor(BLACK)
  {
    leftIR.attach(leftSensor);
    leftIR.interval(10);
    rightIR.attach(rightSensor);
    rightIR.interval(10);
    countState.attach(countSensor);
    countState.interval(50);
  }

  void setup() {
    pinMode(redPin, OUTPUT);
    pinMode(greenPin, OUTPUT);
    pinMode(bluePin, OUTPUT);
    pinMode(motorA, OUTPUT);
    pinMode(motorB, OUTPUT);
    pinMode(leftSensor,INPUT_PULLUP);
    pinMode(rightSensor,INPUT_PULLUP);
    pinMode(countSensor,INPUT_PULLUP);
  }
  
  uint32_t getCurrentColor() {
    return currColor;
  } 

  void setColor(uint32_t rgb) {
    currColor = rgb;
    uint8_t r = (uint8_t)(rgb >> 16);
    uint8_t g = (uint8_t)(rgb >>  8);
    uint8_t b = (uint8_t)rgb;
    analogWrite(redPin, 255-r);	 
    analogWrite(bluePin, 255-b);
    analogWrite(greenPin, 255-g);
  } 

  void setState(int s) {
    state = s;
    if (state == STATE_OFF) {
      moving = false;
    }
    Serial.print("DISK ");Serial.print(id);Serial.print(" STATE ");
    switch (state) {
    case STATE_OFF:
      Serial.println("Off");
      break;
    case STATE_USER:
      Serial.println("Interactive");
      break;
    case STATE_HOME:
      Serial.println("Homing");
      break;
    }
  }

  int getState() {
    return state;
  }

  int getPosition() {
    return position;
  }

  void readSensors() {
    leftIR.update();
    rightIR.update();
    countChanged = countState.update();
    magnetValue = analogRead(homeSensor);
  }

  const int CLOCKWISE = 1;
  const int COUNTERCLOCKWISE = 2;
  void motorMove() {
    if (moving) {
      if (direction == CLOCKWISE) {
        digitalWrite(motorA, HIGH); 
        digitalWrite(motorB, LOW); //1A high and 2A low = turn right
      }
      else if (direction == COUNTERCLOCKWISE) {
        digitalWrite(motorA, LOW); 
        digitalWrite(motorB, HIGH); //1A low and 2A high = turn left  
      }
    }
    else {
      digitalWrite(motorA, LOW); 
      digitalWrite(motorB, LOW); //1A low and 2A low = off  
    }
  }

  bool magnetActive(int magnetValue) {
    return magnetValue > 220 || magnetValue < 200;
  }

  bool isHome() {
    return (magnetActive(magnetValue) && !magnetActive(lastMagnetValue));
  }

  void handleCount() {
    if (countChanged) {
      if (direction == CLOCKWISE) position = (position + REV - 1) % REV;
      else if (direction == COUNTERCLOCKWISE) position = (position + 1) % REV;
      Serial.print("DISK ");Serial.print(id);Serial.print(" POS ");
      Serial.println(position);
    }
  }

  void manage() {

    readSensors();

    if (state == STATE_HOME) {
      if (isHome()) {
        setState(STATE_OFF);
        position = 0;
      }
      else {
        direction = COUNTERCLOCKWISE;
        moving = true;
      }
    }
    else if (state == STATE_USER) {
      handleCount();
      if (rightIR.read() && !leftIR.read()) {
        direction = CLOCKWISE;
        moving = true;
        setColor(color);
      }
      else if (!rightIR.read() && leftIR.read()) {
        direction = COUNTERCLOCKWISE;
        moving = true;
        setColor(color);
      }
      else if (rightIR.read() && leftIR.read()) {    
        moving = false;
        setColor(RED);
      }
      else {
        moving = false;
        setColor(BLACK);
      }
    }
    motorMove();

    lastMagnetValue = magnetValue;
  }
};

Disk disk[3] = {
  Disk(0, DISK0_LEFT_SENSOR, DISK0_RIGHT_SENSOR, DISK0_HOME_SENSOR, DISK0_COUNT_SENSOR,
       DISK0_RED_PIN, DISK0_GREEN_PIN, DISK0_BLUE_PIN,
       DISK0_MOTOR_A, DISK0_MOTOR_B, DISK0_COLOR),
  Disk(1, DISK1_LEFT_SENSOR, DISK1_RIGHT_SENSOR, DISK1_HOME_SENSOR, DISK1_COUNT_SENSOR,
       DISK1_RED_PIN, DISK1_GREEN_PIN, DISK1_BLUE_PIN,
       DISK1_MOTOR_A, DISK1_MOTOR_B, DISK1_COLOR),
  Disk(2, DISK2_LEFT_SENSOR, DISK2_RIGHT_SENSOR, DISK2_HOME_SENSOR, DISK2_COUNT_SENSOR,
       DISK2_RED_PIN, DISK2_GREEN_PIN, DISK2_BLUE_PIN,
       DISK2_MOTOR_A, DISK2_MOTOR_B, DISK2_COLOR)
};

void SetUpIR () {
  // Pin9 is OC2B
  pinMode(9, OUTPUT);  //IR LED output
  TCCR2A = _BV(COM2B0) | _BV(WGM21);
  TCCR2B = _BV(CS20);
  OCR2A = 209;
}


// Convert separate R,G,B into packed 32-bit RGB color.
// Packed format is always RGB, regardless of LED strand color order.
uint32_t Color(uint8_t r, uint8_t g, uint8_t b) {
  return ((uint32_t)r << 16) | ((uint32_t)g <<  8) | b;
}

void setGlobalState(int state) {
  globalState = state;
  if (state == GLOBAL_STATE_HOME) {
    Serial.println("STATE Homing");
    blinkerIdx = timer.every(500, globalBlink, NULL);
    for (int i=0;i<3;i++) disk[i].setState(Disk::STATE_HOME);
  }
  else if (state == GLOBAL_STATE_USER) {
    Serial.println("STATE Playing");
    for (int i=0;i<3;i++) disk[i].setState(Disk::STATE_USER);
  }
  else if (state == GLOBAL_STATE_SUCCESS) {
    Serial.println("STATE Success");
    for (int i=0;i<3;i++) disk[i].setState(Disk::STATE_OFF);
    blinkerIdx = timer.every(500, successBlink, NULL);
    resetIdx = timer.after(10000, doReset, NULL);
  }
}

void globalBlink(void *context) {
  if (globalState == GLOBAL_STATE_HOME) {
    uint32_t t = millis() / 100;
    uint32_t c = (t % 2) ? BLACK : RED;
    for (int i=0;i<3;i++) {
      if (disk[i].getState() == Disk::STATE_HOME) disk[i].setColor(c);
      else disk[i].setColor(GREEN);
    }
  }
}

void successBlink(void *context) {
  uint32_t t = millis() / 100;
  uint32_t c = (t % 2) ? BLACK : GREEN;
  for (int i=0;i<3;i++) disk[i].setColor(c);
}

void doReset(void *context) {
  timer.stop(blinkerIdx);
  timer.stop(resetIdx);
  setGlobalState(GLOBAL_STATE_HOME);
}

void manageGlobalState() {
  if (globalState == GLOBAL_STATE_HOME) {
    bool homed = true;
    for (int i=0;i<3;i++) {
      if (disk[i].getState() == Disk::STATE_HOME) homed = false;
    }
    if (homed) {
      timer.stop(blinkerIdx);
      blinkerIdx = -1;
      for (int i=0;i<3;i++) disk[i].setColor(GREEN);
      delay(1000);
      setGlobalState(GLOBAL_STATE_USER);
    }
  }
  else if (globalState == GLOBAL_STATE_USER) {
    handleCombination(false);
  }
}

void handleCombination(bool absolute) {
  bool success = false;
  if (absolute) {
    success = abs(disk[0].getPosition() - combination[0]) <= 1 &&
      abs(disk[1].getPosition() - combination[1]) <= 1 &&
      abs(disk[2].getPosition() - combination[2]) <= 1;
  }
  else {
    success =
      abs(((disk[1].getPosition() - disk[0].getPosition() + REV) % REV) -
          ((combination[1] - combination[0] + REV) % REV)) <= 1 &&
      abs(((disk[2].getPosition() - disk[1].getPosition() + REV) % REV) -
          ((combination[2] - combination[1] + REV) % REV)) <= 1;
  }
  if (success) {
    setGlobalState(GLOBAL_STATE_SUCCESS);
  }
}

void setup()	 {
  Serial.begin(115200);
  Serial.println("INIT Disk");
  SetUpIR();
  for (int i=0;i<3;i++) {
    disk[i].setup();
  }
  setGlobalState(GLOBAL_STATE_HOME);
}

void loop() {
  timer.update();
  manageGlobalState();
  for (int i=0;i<3;i++) disk[i].manage();
}
