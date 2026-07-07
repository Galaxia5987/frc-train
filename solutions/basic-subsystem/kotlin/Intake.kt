package frc.robot.subsystems.intake

import com.ctre.phoenix6.controls.VoltageOut
import edu.wpi.first.units.measure.Voltage
import edu.wpi.first.wpilibj2.command.Command
import edu.wpi.first.wpilibj2.command.SubsystemBase
import frc.robot.lib.extensions.volts
import frc.robot.lib.universal_motor.UniversalTalonFX

object Intake : SubsystemBase() {

    private val motor = UniversalTalonFX(
        port = PORT,
        config = MOTOR_CONFIG,
    )

    private val voltageOut = VoltageOut(0.0)

    private fun setVoltage(voltage: Voltage): Command = runOnce {
        motor.setControl(voltageOut.withOutput(voltage))
    }

    fun intake(): Command = setVoltage(INTAKE_VOLTAGE)
    fun outtake(): Command = setVoltage(OUTTAKE_VOLTAGE)
    fun stop(): Command = setVoltage(0.0.volts)
}