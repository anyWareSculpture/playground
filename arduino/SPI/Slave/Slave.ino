#include <SPI.h>

volatile char buf[2] = {0x00, 0x00};

void setup (void)
{
  Serial.begin(115200);   // debugging
  Serial.println("Hello SPI slave");

  // Slave config
  pinMode(MISO, OUTPUT);
  pinMode(SS, OUTPUT);
  SPCR |= _BV(SPE);
  
  SPI.attachInterrupt();
}

ISR(SPI_STC_vect)
{
  uint8_t c = SPDR;
  if (c & 0x40) {
//     buf[0] = c;
     c |= 0x01;
  }
  else if (c & 0x20) {
//     buf[1] = c;
     c |= 0x02;
  }
  SPDR = c;
}

void loop (void)
{
}
