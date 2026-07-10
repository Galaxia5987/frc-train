import frc.robot.subsystems.intake.Intake
import kotlin.test.Test
import kotlin.test.assertContains

class IntakeTest {
    @Test
    fun `Test Interface`(){
        assertContains(Intake.intake().javaClass.name,"Command")
        assertContains(Intake.outtake().javaClass.name, "Command")
        assertContains(Intake.stop().javaClass.name,"Command")
    }
}