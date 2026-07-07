# basic-subsystem

Create a basic intake subsystem.

## Description

It will have three states - intake, outtake, and stop. Like a roller.

## Requirements

* It should be an `object`
* It should be named `Intake`

It should have the following public methods(add as many as you want, but these are must):
* `fun intake(): Command`
* `fun outtake(): Command`
* `fun stop(): Command`

It should have one motor controlled by a `VoltageOut` control request.

**IMPORTANT!**
The motor's inputs must be exposed through the subsystem, add this:
```kotlin
val inputs
    get() = motor.inputs
```

## Dependencies
None
