// Yes, this is actually -*-c++-*-

#include "MPR121.h"
#include <Wire.h>

#define CONTINUOUS_OUTPUT


#define IRQ_PIN 2
#define ADDR 0x5A

// Global Constants
#define TOU_THRESH	0x0A
#define	REL_THRESH	0x08

// I2C pins:
// SDA - A4
// SCL - A5

boolean touchStates[12]; //to keep track of the previous touch states

void setup(){
  pinMode(IRQ_PIN, INPUT);
  digitalWrite(IRQ_PIN, HIGH); //enable pullup resistor
  
  Serial.begin(115200);
  Wire.begin();
  MPR121.begin(ADDR);
  mpr121_setup();
  Serial.println("Hello Touch");

  printRegisters();
}

void loop()
{
  readTouchInputs();

  readSerialInput();

}

uint8_t buf[0x80];

void printHex(uint8_t val) {
  if (val < 0x10) Serial.print("0");
  Serial.print(val, HEX);
}

void printRegisters()
{
  Serial.print("reg ");
  for (unsigned char i=0;i<0x80;i++) {
    printHex(MPR121.getRegister(i));
    Serial.print(" ");
  }
  Serial.println();
}

int serial_index = 0;
char serial_buffer[10];
void readSerialInput()
{
  while(Serial.available() > 0) {
    char c = Serial.read();
    if (c == '\n' || c == '\r') {
      // Protocol: "<reg> <val>"
      if (!strcmp(serial_buffer, "reg")) {
        printRegisters();
      }
      else if (!strcmp(serial_buffer, "reset")) {
        MPR121.begin(ADDR);
        mpr121_setup();
      }
      else if (serial_index == 5 && serial_buffer[2] == ' ') {
        serial_buffer[2] = '\0';
        uint8_t reg = strtol(serial_buffer, NULL, 16);
        uint8_t val = strtol(serial_buffer+3, NULL, 16);
        MPR121.setRegister(reg, val);
        Serial.print("Register ");
        printHex(reg);
        Serial.print(" set to ");
        printHex(val);
        Serial.println();
      }
      serial_index = 0;
      serial_buffer[serial_index] = '\0';
    }
    else {
      serial_buffer[serial_index++] = c;
      if (serial_index == 10) serial_index--;
      serial_buffer[serial_index] = '\0'; // Keep the string NULL terminated
    }
  }
}

void readTouchInputs()
{
#ifdef CONTINUOUS_OUTPUT
  bool run = true;
#else
  bool run = !checkInterrupt();
#endif

  if (run) {
    MPR121.updateAll();

    Serial.print("data ");
    for (int i=0;i<8;i++) {
      // Reading
      uint16_t reading = MPR121.getFilteredData(i);
      Serial.print(reading);
      Serial.print(" ");
      // Baseline
      Serial.print(MPR121.getBaselineData(i));
      Serial.print(" ");
      // Touch flag
      
      Serial.print(MPR121.getTouchData(i));
      Serial.print(" ");
    }
    Serial.println();
    //    delay(100);
  }
}




void mpr121_setup(void)
{
  if (!MPR121.reset()) {
    Serial.println("Error: reset failed!");
    return;
  }
  
  // Set baselines
  //  for (uint8_t i=0;i<12;i++) MPR121.setRegister(MPR121_BVR + i, 0);
  /*
    Wire.beginTransmission(ADDR);
    Wire.write(MPR121_BVR);
    for (uint8_t i=0;i<12;i++) Wire.write(0);
    Wire.endTransmission();
  */

  // Section A - Controls filtering when data is > baseline.
  MPR121.setRegister(MHDR, 0x01); // Set Max Half Delta to 1
  MPR121.setRegister(NHDR, 0x01); // Set Noise Half Delta to 1
  MPR121.setRegister(NCLR, 0x00); // Set Noise Count Limit to 1
  MPR121.setRegister(FDLR, 0x00); // Set Filter Delay Limit to 1

  // Section B - Controls filtering when data is < baseline.
  MPR121.setRegister(MHDF, 0x01);
  MPR121.setRegister(NHDF, 0x01);
  MPR121.setRegister(NCLF, 0xFF);
  MPR121.setRegister(FDLF, 0x02);
  
  // Section C - Sets touch and release thresholds for each electrode
  for (uint8_t i=0;i<12;i++) {
    MPR121.setRegister(E0TTH + 2*i, TOU_THRESH);
    MPR121.setRegister(E0RTH + 2*i, REL_THRESH);
  }

  // Section D
  // Set the Filter Configuration
  // AFE1 = CDC configuration:
  // 0xC0: 34 samples
  // 0x3f: 63 uA current
  MPR121.setRegister(AFE1, 0xFF);
  // AFE2 = CDT configuration:
  // 0x04: Set ESI - Electrode Sample Interval to 16 ms
  // 0xE0: Set CDT - charge time to 32 uS
  MPR121.setRegister(AFE2, 0xE4);
  
  // Section E
  // Electrode Configuration
  // Set ECR to 0x00 to return to standby mode

  // Section F
  // Enable Auto Config and auto Reconfig
  //MPR121.setRegister(MPR121_AUTO0, 0x01);

  //  MPR121.setRegister(MPR121_AUTO1, 0x0B);
  //  MPR121.setRegister(ATO_CFGU, 0xC9);  // USL = (Vdd-0.7)/vdd*256 = 0xC9 @3.3V   MPR121.setRegister(ATO_CFGL, 0x82);  // LSL = 0.65*USL = 0x82 @3.3V
  //  MPR121.setRegister(ATO_CFGT, 0xB5);*/  // Target = 0.9*USL = 0xB5 @3.3V

  // 0x08 - Turn on electrodes 0-7
  // 0x40 - Baseline tracking disabled
  // 0x00 - Baseline tracking enabled
  MPR121.setRegister(ECR, 0x08); // Baseline tracking on
  //MPR121.setRegister(ECR, 0x48); // Baseline tracking off
}


boolean checkInterrupt(void){
  return digitalRead(IRQ_PIN);
}
