package frc.robot.subsystems.sensors

import com.ctre.phoenix6.configs.CANrangeConfiguration
import com.ctre.phoenix6.configs.ProximityParamsConfigs
import frc.robot.lib.extensions.get
import frc.robot.lib.extensions.m

const val SENSOR_PORT = 0

val SENSOR_CONFIG = CANrangeConfiguration().apply {
    ProximityParams = ProximityParamsConfigs().apply {
        ProximityThreshold = 0.15.m[m]
    }
}