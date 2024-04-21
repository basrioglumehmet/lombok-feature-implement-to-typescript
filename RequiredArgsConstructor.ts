/* eslint-disable @typescript-eslint/no-explicit-any */
import "reflect-metadata"; // Importing 'reflect-metadata' for metadata reflection

/**
 * @author mehmetbasrioglu
 * 
 * Decorator that automatically assigns default values or creates instances for class parameters
 * based on their types and metadata.
 * @param constructor The constructor function of the class.
 * @returns The extended class with automatically assigned parameters.
 */
function RequiredArgsConstructor<T extends new (...args: any[]) => Record<string, any>>(constructor: T) {
  return class extends constructor { // Extending the original class with the decorator functionality
    constructor(...args: any[]) { // Override the constructor to add custom behavior
      super(...args); // Call the original constructor with its arguments
      // Retrieve parameter types from class metadata
      const paramTypes = Reflect.getMetadata('design:paramtypes', constructor) || [];
      // Extract parameter names from constructor
      const paramNames = constructor.toString().match(/\((.*?)\)/);
      // Check if parameters exist
      if (paramNames && paramNames[1]) {
        // Split and trim parameter names
        const paramNamesArray = paramNames[1].split(',').map((param: string) => param.trim());
        // Iterate over parameters
        paramNamesArray.forEach((paramName: string, index: number) => {
          // Check if parameter is undefined and has a type
          if (args[index] === undefined && paramTypes[index]) {
            // Get parameter type
            const paramType = paramTypes[index];
            // Check if parameter type is a class
            if (typeof paramType === 'function' && paramType.prototype) {
              // Declare a variable to hold the parameter value
              let ref: any;
              // Retrieve singleton metadata for the class
              const metadata = Reflect.getMetadata('singleton', paramType);
              if (metadata) {
                // Use existing instance if class is a singleton
                ref = metadata.instance;
              } else {
                // Create new instance if class is not a singleton
                ref = new paramType();
                // Define singleton metadata for the class
                Reflect.defineMetadata('singleton', { instance: ref }, paramType);
              }
              // Assign parameter value to the instance
              this[paramName] = ref;
            } else if (paramType === String) {
              // Assign default value for String type
              this[paramName] = '';
            } else if (paramType === Number) {
              // Assign default value for Number type
              this[paramName] = 0;
            } else if (paramType === Boolean) {
              // Assign default value for Boolean type
              this[paramName] = false;
            } // Additional default values for other types can be added here
          }
        });
      }
    }
  };
}

export default RequiredArgsConstructor; // Exporting the decorator function
