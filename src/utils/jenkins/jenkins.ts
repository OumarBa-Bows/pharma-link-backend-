import Jenkins from "jenkins";
export const jenkins = new Jenkins({
  baseUrl: `https://${process.env.JENKINS_USER}:${process.env.JENKINS_API_TOKEN}@${process.env.JENKINS_HOST}`,
  crumbIssuer: true,
  headers: {
    rejectUnauthorized: true,
  },
});
