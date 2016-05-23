#include <SPI.h>

void setup()
{
  Serial.begin (115200);
  Serial.println("Hello SPI master");
  SPI.begin();
}

const char *str = "Hello\n";

void loop()
{
  SPI.beginTransaction(SPISettings(F_CPU/4, MSBFIRST, SPI_MODE0));
  for (uint8_t i=0;i<strlen(str);i++) {
    SPI.transfer(str[i]);
  }
  SPI.endTransaction();
  delay(100);
}

