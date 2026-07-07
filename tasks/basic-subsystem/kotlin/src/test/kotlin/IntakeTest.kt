import edu.wpi.first.wpilibj2.command.Command
import edu.wpi.first.wpilibj2.command.CommandScheduler
import frc.robot.lib.extensions.volts
import frc.robot.lib.universal_motor.LoggedMotorInputs
import frc.robot.subsystems.intake.Intake
import helpers.schedule
import helpers.startScheduler
import java.lang.Thread.sleep
import kotlin.test.Test
import kotlin.test.assertContains
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class IntakeTest {
    @Test
    fun `Test Interface`(){
        assertContains(Intake.intake().javaClass.name,"Command")
        assertContains(Intake.outtake().javaClass.name, "Command")
        assertContains(Intake.stop().javaClass.name,"Command")
        assertEquals(LoggedMotorInputs::class.java.name,Intake.inputs.javaClass.name)
    }

    @Test
    fun `Test Motor`(){
        startScheduler()
        sleep(3000)
        schedule(Intake.intake())
        sleep(200)
        assertTrue { Intake.inputs.voltage > 0.0.volts }
        schedule(Intake.outtake())
        sleep(200)
        assertTrue { Intake.inputs.voltage < 0.0.volts }
        schedule(Intake.stop())
        sleep(200)
        assertTrue { Intake.inputs.voltage == 0.0.volts }
    }
}