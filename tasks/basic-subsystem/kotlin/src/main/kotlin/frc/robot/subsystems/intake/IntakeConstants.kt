package frc.robot.subsystems.intake

import com.ctre.phoenix6.configs.TalonFXConfiguration
import frc.robot.lib.extensions.volts

const val PORT = 0

val INTAKE_VOLTAGE = 5.volts
val OUTTAKE_VOLTAGE = (-5).volts

val MOTOR_CONFIG =
    TalonFXConfiguration()
