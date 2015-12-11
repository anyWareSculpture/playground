// Yes, this is actually -*-c++-*-

#include <Adafruit_NeoPixel.h>
#include <Bounce2.h>

// Pins
const int IRPin1 = 4;  // IR pins
const int IRPin2 = 5;
const int IRPin3 = 6;
const int IRPin4 = 7;
const int IRPin5 = 8;
const int IRPin6 = 9;
const int IRPin7 = 10;
const int IRPin8 = 11;
const int IRPin9 = 12;
const int IRPin10 = 13;

// Colors
uint32_t RED = Color(255,0,0);
uint32_t GREEN = Color(0,255,0);
uint32_t BLACK = Color(0,0,0);
uint32_t PINK = Color(255,20,147);
uint32_t MYGREEN = Color(0,201,87);
uint32_t MYBLUE = Color(0,20,147);

// Which pin on the Arduino is connected to the NeoPixels?
#define NEOPIXEL_PIN            2
// How many NeoPixels are attached to the Arduino?
#define NUMPIXELS      10
Adafruit_NeoPixel pixels = Adafruit_NeoPixel(NUMPIXELS, NEOPIXEL_PIN, NEO_GRB + NEO_KHZ800);

int currSensor = -1;   // Storage of which IR is pressed
int prevSensor = -1;    // Storage of which IR is pressed
unsigned long lastActionTime;

#define MAXCOMBO 10

int currentLevel = 0;
int recorded[MAXCOMBO];
int numActions = 0; // # of actions recorded

struct Combination {
  uint8_t length;
  uint8_t combo[MAXCOMBO];
  Combination(uint8_t a, uint8_t b, uint8_t c) {
    length = 3;
    combo[0] = a; combo[1] = b; combo[2] = c;
  }
  Combination(uint8_t a, uint8_t b, uint8_t c, uint8_t d) {
    length = 4;
    combo[0] = a; combo[1] = b; combo[2] = c; combo[3] = d;
  }
  Combination(uint8_t a, uint8_t b, uint8_t c, uint8_t d, uint8_t e) {
    length = 5;
    combo[0] = a; combo[1] = b; combo[2] = c; combo[3] = d; combo[4] = e;
  }

  bool check(int num, int *recorded) {
    for (int i = 0; i < num; i++) {
      if (combo[i] != recorded[i]) return false; 
    }
    return true;
  }

  uint8_t getLength() { return length; }

  int getPixel(uint8_t idx) { return combo[idx]; }
};

// Configuration

unsigned long wait = 3000;   // This is how long Simon waits before restarting
int dictateDelay = 800;   // How fast is the dictate being played back

Combination combos[] = {
  Combination(4,8,2),
  Combination(0,2,4,8,6),
  Combination(9,4,8,4,3)
};

struct IRPixel {
  int id;
  int sensorPin;

  Bounce irState;
  bool state;

  IRPixel(int pixelid, int pin) : id(pixelid), sensorPin(pin), state(false) {}

  void setup() {
    pinMode(sensorPin, INPUT_PULLUP);
    irState.attach(sensorPin);
    irState.interval(100);
  }
  
  void readSensor() {
    if (irState.update()) state = irState.read();
  }

  bool getState() {
    return state;
  }

  void setColor(uint32_t col) {
    pixels.setPixelColor(id, col);
  }

};

IRPixel irpixels[NUMPIXELS] = {
  IRPixel(0, IRPin1),
  IRPixel(1, IRPin2),
  IRPixel(2, IRPin3),
  IRPixel(3, IRPin4),
  IRPixel(4, IRPin5),
  IRPixel(5, IRPin6),
  IRPixel(6, IRPin7),
  IRPixel(7, IRPin8),
  IRPixel(8, IRPin9),
  IRPixel(9, IRPin10)
};

void setAllColors(uint32_t col) {
  for (int i = 0; i < NUMPIXELS; i++) irpixels[i].setColor(col);
  pixels.show(); // This sends the updated pixel color to the hardware. 
}

void setComboColors(uint32_t col) {
  for (int i = 0; i < combos[currentLevel].getLength(); i++) {
    irpixels[combos[currentLevel].getPixel(i)].setColor(col);
  }
  pixels.show();
}


void setup() {
  SetUpIR();
  Serial.begin(115200);
  Serial.println("Hello Simon");
  for (int i=0;i<NUMPIXELS;i++) irpixels[i].setup();
  pixels.begin(); // This initializes the NeoPixel library.
  for (int i=0;i<MAXCOMBO;i++) recorded[i] = -1;
}

void loop() { 
  SimonDictates();
  reset();
  lastActionTime = millis();
  Serial.println("Waiting...");
  while (millis() - lastActionTime < wait) {
    SimonWaits();  // wait indicates how long Simon waits. This should be relative to the length of array.
  }
  Serial.println("End of loop");
}

void SimonDictates() { // here the program runs through a combination in the array NeoPixel
  Serial.print("Dictating level ");
  Serial.println(currentLevel);
  // loop from the lowest neopixel to the highest:
  for (int i = 0; i < combos[currentLevel].getLength(); i++) {
    irpixels[combos[currentLevel].getPixel(i)].setColor(PINK); // pink color.
    if (i > 0) irpixels[combos[currentLevel].getPixel(i-1)].setColor(BLACK); // pink color.
    pixels.show(); // This sends the updated pixel color to the hardware.
    delay(dictateDelay);
  }
  irpixels[combos[currentLevel].getPixel(combos[currentLevel].getLength()-1)].setColor(BLACK); // no color.
  pixels.show(); // This sends the updated pixel color to the hardware.
}

void reset() {
  // FIXME: Reset waiting combo
  setAllColors(BLACK);
  numActions = 0;
}

bool checkCombo() {
  return combos[currentLevel].check(numActions, recorded);
}

void SimonWaits() {
  for (int i=0;i<NUMPIXELS;i++) irpixels[i].readSensor();

  if (numSensorsActive() > 1) {
    wrong();
    return;
  }

  currSensor = getCurrentSensor(); // Which sensor is currently triggered?

  if (currSensor >= 0) {
    if (prevSensor == -1) { // Only display when first activated
      irpixels[currSensor].setColor(MYBLUE);
      pixels.show();
    }
  }
  else {
    setAllColors(BLACK);
  }

  // this measures if the IR has changed from not being pressed to being pressed
  if (prevSensor == -1 && currSensor >= 0) {
    recorded[numActions++] = currSensor;
    lastActionTime = millis();
    bool ok = checkCombo();
    if (!ok) wrong();
    else if (numActions == combos[currentLevel].getLength()) {
      right();
      currentLevel = (currentLevel + 1)%3;
    }
  }

  prevSensor = currSensor;
}

void wrong() {
  setAllColors(BLACK);

  if (currSensor >= 0) {
    irpixels[currSensor].setColor(RED);
    pixels.show();
  }
  //  setComboColors(RED);

  delay(1000);
  setAllColors(BLACK);
  reset();
  lastActionTime = 0;
}

void right() {
  for (int loopSuccess = 0; loopSuccess < 5; loopSuccess++) {
    setComboColors(MYGREEN);
    delay(200);
    setComboColors(BLACK);
    delay(200);     
  }
  reset();
  lastActionTime = 0;
}

// Returns the index of the first active sensor or -1 if no sensors are active
int getCurrentSensor() {
  for (int i=0;i<NUMPIXELS;i++) {
    if (irpixels[i].getState()) return i;
  }
  return -1; 
}

// Returns false if more than one sensor is active
uint8_t numSensorsActive() {
  int count = 0;
  for (int i=0;i<NUMPIXELS;i++) {
    if (irpixels[i].getState()) {
      count++;
    }
  }
  return count;
}

void SetUpIR() {
  // Pin3 is OC2B
  pinMode(3, OUTPUT);  //IR LED output
  TCCR2A = _BV(COM2B0) | _BV(WGM21);
  TCCR2B = _BV(CS20);
  OCR2A = 209;
}

// Convert separate R,G,B into packed 32-bit RGB color.
// Packed format is always RGB, regardless of LED strand color order.
uint32_t Color(uint8_t r, uint8_t g, uint8_t b) {
  return ((uint32_t)r << 16) | ((uint32_t)g <<  8) | b;
}

