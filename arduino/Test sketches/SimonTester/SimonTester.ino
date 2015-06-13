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

void setup() {
  SetUpIR();
  Serial.begin(115200);
  Serial.println("Hello SimonTester");
  for (int i=0;i<NUMPIXELS;i++) irpixels[i].setup();
  pixels.begin(); // This initializes the NeoPixel library.
}

void loop() { 

  int numpixels = 0;
  for (int i=0;i<NUMPIXELS;i++) {
    irpixels[i].readSensor();
    if (irpixels[i].getState()) numpixels++;
  }
  uint32_t col;
  switch (numpixels) {
  case 0:
    col = BLACK;
    break;
  case 1:
    col = RED;
    break;
  case 2:
    col = MYGREEN;
    break;
  case 3:
    col = MYBLUE;
    break;
  default:
    col = PINK;
    break;
  }
  for (int i=0;i<NUMPIXELS;i++) irpixels[i].setColor(irpixels[i].getState() ? col : BLACK);
  pixels.show();
  return;
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
