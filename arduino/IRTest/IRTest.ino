// Yes, this is actually -*-c++-*-

void setup()
{
  // Pin3 is OC2B
  pinMode(3, OUTPUT);
  pinMode(12, OUTPUT);
  digitalWrite(12, 0);
  pinMode(8, INPUT_PULLUP);
  Serial.begin(115200);
  Serial.println("Hello IRTest");

  TCCR2A = _BV(COM2B0) | _BV(WGM21);
  TCCR2B = _BV(CS20);
  OCR2A = 209;
}

void loop()
{
  digitalWrite(12, digitalRead(8));
}
