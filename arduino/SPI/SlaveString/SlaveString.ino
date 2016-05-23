#include <SPI.h>

char buf[20];
volatile uint8_t pos = 0;
volatile bool end_of_packet = false;

void setup (void)
{
  Serial.begin(115200);   // debugging
  Serial.println("Hello SPI slave");

  // Slave config
  pinMode(MISO, OUTPUT);
  SPCR |= _BV(SPE);
  
  SPI.attachInterrupt();
}

ISR (SPI_STC_vect)
{
  uint8_t c = SPDR;
  if (pos < sizeof buf) {
    buf[pos++] = c;
    if (c == '\n') end_of_packet = true;
  }
}

void loop (void)
{
  if (end_of_packet) {
    buf [pos] = 0;  
    Serial.print(buf);
    pos = 0;
    end_of_packet = false;
  }
}
