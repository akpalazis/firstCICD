const validateData = async (username, password) => {
    if ((username === undefined) && (password === undefined)) {
      throw new Error("Username and Password field not found");
    }
    if (username === undefined){
      throw new Error("Username field not found")
    }
    if (password === undefined){
      throw new Error("Password field not found")
    }

    if ((!username) && (!password)){
      throw new Error("Empty Username and Password Field")
    }
    if (!username){
      throw new Error("Empty Username Field")
    }

    if (!password){
      throw new Error("Empty Password Field")
    }
};

module.exports = {validateData}