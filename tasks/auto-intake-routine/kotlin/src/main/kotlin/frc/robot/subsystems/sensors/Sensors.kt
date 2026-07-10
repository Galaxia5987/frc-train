package frc.robot.subsystems.sensors

import edu.wpi.first.wpilibj2.command.SubsystemBase
import edu.wpi.first.wpilibj2.command.button.Trigger
import frc.robot.lib.unified_canrange.UnifiedCANRange

object Sensors : SubsystemBase() {
    private val sensor = UnifiedCANRange(SENSOR_PORT, configuration = SENSOR_CONFIG)

    val hasGamePiece = Trigger {sensor.isInRange}

    override fun periodic(){
        sensor.periodic()
    }
}