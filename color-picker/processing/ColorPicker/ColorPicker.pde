import processing.serial.*;

Serial port; 
float xmag, ymag = 0;
float newXmag, newYmag = 0;

void setup() 
{ 
  
  size(512, 256); 
   noStroke(); 
   colorMode(HSB, 255);
   
  frameRate(10); 
  for(int i=0; i<255; i++) {
    for(int j=0; j<255; j++) {
      stroke(i, j, 255);
      point(i, j);
    }
  }

  // Open the port that the Arduino board is connected to (in this case #0) 
  // Make sure to open the port at the same speed Arduino is using (9600bps) 
  port = new Serial(this, Serial.list()[0], 9600); 
}

float getRed() 
{ 
  return red(get(mouseX,mouseY));

}

float getGreen() 
{ 
  return (green(get(mouseX,mouseY)));

}

float getBlue()
{
  return (blue(get(mouseX,mouseY)));
}

void draw() 
{ 
  int r = 0;
  int g = 0;
  int b = 0;
  r = int(getRed());
  g = int(getGreen());
  b = int(getBlue());
    println("r =" + r);
    println("g =" + g);
    println("b =" + b);

  port.write(r);
  port.write(g);
  port.write(b);

}

