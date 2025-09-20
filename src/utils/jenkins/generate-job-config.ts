import { GlobalKeys } from "../../configs/GlobalKeys.config";

export function generateJobConfig(
  cronSpec: string,
  orderId: string | number,
  orderData: Record<string, any>
): string {
  // Escape single quotes for shell-embedded JSON
  const escapedOrderData = JSON.stringify(orderData).replace(/'/g, "\\'");
  const pos_reminderUrl= `${process.env.POS_BACKEND_URL}/api/orderJob/order-reminder`
  return `<?xml version='1.1' encoding='UTF-8'?>
  <project>
    <actions/>
    <description>Reminder for order ${orderId}</description>
    <keepDependencies>false</keepDependencies>
    <properties/>
    <scm class="hudson.scm.NullSCM"/>
    <canRoam>true</canRoam>
    <disabled>false</disabled>
    <blockBuildWhenDownstreamBuilding>false</blockBuildWhenDownstreamBuilding>
    <blockBuildWhenUpstreamBuilding>false</blockBuildWhenUpstreamBuilding>
    <triggers>
      <hudson.triggers.TimerTrigger>
        <spec>${cronSpec}</spec>
      </hudson.triggers.TimerTrigger>
    </triggers>
    <concurrentBuild>false</concurrentBuild>
    <builders>
      <hudson.tasks.Shell>
        <command>curl -X POST ${pos_reminderUrl} \\
        -H "Content-Type: application/json" \\
        -H "livii-pos: A1b2C3d4E5f6G7h8I9j0K1l2M3n4O5p6" \\
        -d '{"orderId":"${orderId}"}'</command>
        <configuredLocalRules/>
      </hudson.tasks.Shell>
    </builders>
    <publishers/>
    <buildWrappers>
      <hudson.plugins.wscleanup.PreBuildCleanup plugin="ws-cleanup@0.48">
        <deleteDirs>false</deleteDirs>
        <cleanupParameter></cleanupParameter>
        <externalDelete></externalDelete>
        <disableDeferredWipeout>false</disableDeferredWipeout>
      </hudson.plugins.wscleanup.PreBuildCleanup>
      <hudson.plugins.timestamper.TimestamperBuildWrapper plugin="timestamper@1.28"/>
    </buildWrappers>
  </project>`;
}

export function dateToCronSpec(date: Date): string {
  const minutes = date.getMinutes();
  const hours = date.getHours();
  const dayOfMonth = date.getDate();
  const month = date.getMonth() + 1; // getMonth() is 0-based

  // Jenkins cron format: MIN HOUR DOM MONTH DOW
  return `${minutes} ${hours} ${dayOfMonth} ${month} *`;
}

export function generateJobName(orderId: string | number): string {
  return `${GlobalKeys.ORDER_JOB_NAME_KEY}${orderId}-${process.env.PUBLIC_ENVIRONMENT}`;
}
