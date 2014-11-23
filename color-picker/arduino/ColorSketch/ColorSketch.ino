#include "LPD8806.h"
#include "SPI.h"

// Example to control LPD8806-based RGB LED Modules in a strip

/*****************************************************************************/

// Number of RGB LEDs in strand:
int nLEDs = 32;

// Chose 2 pins for output; can be any valid output pins:
int dataPin  = 3;
int clockPin = 4;

// First parameter is the number of LEDs in the strand.  The LED strips
// are 32 LEDs per meter but you can extend or cut the strip.  Next two
// parameters are SPI data and clock pins:
LPD8806 strip = LPD8806(nLEDs, dataPin, clockPin);

// You can optionally use hardware SPI for faster writes, just leave out
// the data and clock pin parameters.  But this does limit use to very
// specific pins on the Arduino.  For "classic" Arduinos (Uno, Duemilanove,
// etc.), data = pin 11, clock = pin 13.  For Arduino Mega, data = pin 51,
// clock = pin 52.  For 32u4 Breakout Board+ and Teensy, data = pin B2,
// clock = pin B1.  For Leonardo, this can ONLY be done on the ICSP pins.
//LPD8806 strip = LPD8806(nLEDs);

int serialColors[6];
int serialCount = 0;

void setup() {

  Serial.begin(9600);
  Serial.println("Hello LEDs");

  // Start up the LED strip
  strip.begin();

  // Update the strip, to start they are all 'off'
  strip.show();
}


uint32_t col1, col2;

void loop() {

  if (Serial.available() > 0) {
    
    serialColors[serialCount] = Serial.read();
    serialCount++;
    
    if (serialCount > 5) {
      col1 = strip.Color(serialColors[0],
                         serialColors[1],       
                         serialColors[2]);
      col2 = strip.Color(serialColors[3],
                         serialColors[4],       
                         serialColors[5]);
      serialCount = 0;

      // Fill the entire strip with...
      colorWipe(col1, col2);
    }

  }
}

// Fill the dots progressively along the strip.
void colorWipe(uint32_t d, uint32_t d2) {
  int i;

  for (i=0; i < 16; i++) {
      strip.setPixelColor(i, d);
      strip.show();
  }
  for (i=16; i < 32; i++) {
      strip.setPixelColor(i, d2);
      strip.show();
  }
}
