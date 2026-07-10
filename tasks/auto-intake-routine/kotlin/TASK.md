# auto-intake-routine

Compose commands to automate the intake process.

## Description

Instead of a driver holding a button, the robot should intake automatically until it detects a piece.

## Requirements

* Create a file named `IntakeRoutines.kt`.

* Write a function `fun acquireGamePiece(): Command`.

* Use `Commands.sequence()` or `.until()` to start the intake, wait until `IndexerSensors. hasGamePiece` is true, and then stop the intake.

## Dependencies
- basic-intake
- can-range-sensor