#include <SPI.h>

#define NUMDEVICES 2

char buf[2] = {0x00, 0x00};

void setup()
{
  Serial.begin(115200);
  Serial.println("Hello SPI master");
  SPI.begin();
}

//#define SPEED 8000000/4
#define SPEED 8000000/32

void loop()
{
  SPI.beginTransaction(SPISettings(SPEED, MSBFIRST, SPI_MODE0));
  for (uint8_t i=0;i<2*(NUMDEVICES+1);i++) {
    uint8_t c = SPI.transfer(i%2 ? 0x20 : 0x40);
    if (c & 0x40) {
      buf[0] = c;
    }
    else if (c & 0x20) {
      buf[1] = c;
    }
    delay(5);
  }
  SPI.endTransaction();

  Serial.print("Round-trip: ");
  Serial.print(buf[0], HEX);
  Serial.print(" ");
  Serial.print(buf[1], HEX);
  Serial.println();
}
