// import MyStack from "./MyStack";
import mySqlStack from "./mySqlStack";
export default function main(app) {
  // Set default runtime for all functions
  app.setDefaultFunctionProps({
    runtime: "nodejs12.x"
  });

  // new MyStack(app, "my-stack");

  new mySqlStack(app,"mysql-stack")
  // Add more stacks
}
