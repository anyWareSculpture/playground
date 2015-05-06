// Yes, this is actually -*-c++-*-

#define TOUCH_SENSOR_PIN  2

// Tuned for proximity sensor
#define TOUCH_THRESHOLD   50
#define	RELEASE_THRESHOLD 30

// I2C pins:
// SDA - A4
// SCL - A5

#include <Wire.h>
#include "./MPR121.h"

struct TouchSensor {
  int address;
  int irq_pin;
  bool status;

  TouchSensor(int pin, int addr = 0x5A) : irq_pin(pin), address(addr), status(false)  {}

  void setup() {
    Wire.begin();
    MPR121.begin(address);
    
    MPR121.setInterruptPin(irq_pin);

    // Enable _only_ electrode 0
    MPR121.setRegister(ECR, 0x81);
    
    MPR121.setTouchThreshold(TOUCH_THRESHOLD);
    MPR121.setReleaseThreshold(RELEASE_THRESHOLD);  
  }

  bool update() {
    bool changed = MPR121.touchStatusChanged();
    if (changed) {
      MPR121.updateTouchData();
      if (MPR121.isNewTouch(0)) status = true;
      else if (MPR121.isNewRelease(0)) status = false;
    }
    return changed;
  }

  bool getStatus() {
    return status;
  }

};

TouchSensor touch(TOUCH_SENSOR_PIN);

void setup()
{
  touch.setup();

  Serial.begin(115200);
  Serial.println("\nINIT handshake");
}

void loop()
{
  if (touch.update()) {
    Serial.print("HANDSHAKE ");
    Serial.println(touch.getStatus());
  }
}
