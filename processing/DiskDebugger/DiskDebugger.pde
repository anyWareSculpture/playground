import processing.serial.*;
import controlP5.*;

ControlP5 cp5;

Serial myPort;        // The serial port
boolean started = false;

String globalstate = "";
int diskpos[] = {0,0,0};
String diskstate[] = {"","",""};


void setup () {
    // set the window size:
    size(1000, 1000);
 
    // List all the available serial ports
    String[] list = Serial.list();
    println(Serial.list());
    String arduinoport = list[list.length - 1];
    if (arduinoport.toLowerCase().contains("usb")) {
      myPort = new Serial(this, arduinoport, 115200);
      // don't generate a serialEvent() unless you get a newline character:
      myPort.bufferUntil('\n');
    }
    // set inital background:
    background(0);

    PFont font = createFont("monaco",12);
    cp5 = new ControlP5(this);
}

public void sendString(String str) {
  println("Sending: " + str);
  myPort.write(str + "\n");
}

public void controlEvent(ControlEvent theEvent) {

}

void draw () {
    background(0);
    stroke(127,34,255);

    textSize(24);
    textAlign(CENTER);
    ellipseMode(RADIUS); 
    rectMode(RADIUS); 

    fill(255,255,255);
    text(globalstate, 500, 200);
    fill(255,100,100);
    stroke(255,100,100);
    pushMatrix();
    translate(500, 500);
    text(diskstate[0], 0, -30);
    rotate(radians(-diskpos[0]*360/66));
    text(diskpos[0], 0, -208);
    rect(0, -180, 9, 20);
    noFill();
    ellipse(0,0,200,200);
    popMatrix();

    fill(100,255,100);
    stroke(100,255,100);
    pushMatrix();
    translate(500, 500);
    text(diskstate[1], 0, 0);
    rotate(radians(-diskpos[1]*360/66));
    text(diskpos[1], 0, -228);
    rect(0, -170, 7, 20);
    noFill();
    ellipse(0,0,190,190);
    popMatrix();

    fill(100,100,255);
    stroke(100,100,255);
    pushMatrix();
    translate(500, 500);
    text(diskstate[2], 0, 30);
    rotate(radians(-diskpos[2]*360/66));
    text(diskpos[2], 0, -248);
    rect(0, -160, 5, 20);
    noFill();
    ellipse(0,0,180,180);
    popMatrix();
}

void serialEvent (Serial myPort) {
    // get the ASCII string:
    String inString = myPort.readStringUntil('\n');
    println("Serial: " + inString);
    if (inString != null) {
        // trim off any whitespace:
        inString = trim(inString);

        if (!started && inString.contains("INIT Disk")) started = true;
        if (!started) return;
        String[] strvalues  = split(inString, ' ');
        if (strvalues.length > 0) {
          if (strvalues[0].equals("STATE")) handleState(strvalues);
          else if (strvalues[0].equals("DISK")) handleDisk(strvalues);
          else println(inString);
        }
    }
}

void handleState(String[] strvalues) {
  globalstate = strvalues[1];
}

void handleDisk(String[] strvalues) {

  int disk = int(strvalues[1]);
  if (strvalues[2].equals("STATE")) {
    diskstate[disk] = strvalues[3];
  }
  else if (strvalues[2].equals("POS")) {
    diskpos[disk] = int(strvalues[3]);
  }
}

