package helpers

import edu.wpi.first.hal.NotifierJNI
import edu.wpi.first.wpilibj.RobotController
import edu.wpi.first.wpilibj2.command.Command
import edu.wpi.first.wpilibj2.command.CommandScheduler
import frc.robot.Robot
import org.littletonrobotics.junction.Logger
import kotlin.concurrent.thread

fun startScheduler(){
    var nextCycleUs: Long = 0
    val periodUs: Long = (0.02 * 1000000).toLong()
    thread(start=true, isDaemon = true, name = "RobotPeriodic"){
        Robot.simulationInit()
//        while (true) {
//            val currentTimeUs = RobotController.getFPGATime()
//            if (nextCycleUs < currentTimeUs) {
//                // Loop overrun, start next cycle immediately
//                nextCycleUs = currentTimeUs
//            }
//            nextCycleUs += periodUs
//
//            val periodicBeforeStart = RobotController.getFPGATime()
//            val userCodeStart = RobotController.getFPGATime()
//            Robot.robotPeriodic()
//            val userCodeEnd = RobotController.getFPGATime()
//        }
    }
}

fun schedule(command: Command){
    CommandScheduler.getInstance().schedule(command)
}