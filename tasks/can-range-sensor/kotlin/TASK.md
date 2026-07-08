# can-range-sensor

Read data from a proximity sensor to detect game pieces.

## Description

You need to detect when a game piece is fully inside the robot using the `UnifiedCANRange` wrapper.

## Requirements

* Create an `object` named `Sensors` inside the `frc.robot.subsystems.sensors` package.

* Instantiate a `UnifiedCANRange` sensor.

* Expose a `val hasGamePiece: Trigger` property.

* The trigger should return true when the sensor detects an object within 0.15.m.

* You must call the sensor's `periodic()` method inside the object's `periodic()` block.

## Dependencies
None
