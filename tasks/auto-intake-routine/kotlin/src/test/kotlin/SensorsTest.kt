import frc.robot.subsystems.sensors.Sensors
import kotlin.test.Test
import kotlin.test.assertContains
import kotlin.test.assertNotNull

class SensorsTest {
    @Test
    fun `Test Interface`(){
        assertContains(Sensors.hasGamePiece.javaClass.name, "Trigger")
        assertNotNull(Sensors.name, "Sensors isn't a subsystem!")
    }
}