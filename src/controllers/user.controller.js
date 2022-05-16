const StatusCodes = require("http-status-codes");
const userModel = require("../models/user.model");
const userDao = require("../dao/user.dao");
const passwordService = require("../services/passwordService");
const sendMail = require("../services/mailService");
const validate = require("../services/verification");
const validateWitoutPassword = require("../services/verificationWithoutPassword");
const roleDao = require("../dao/role.dao");
const sendMail2 = require("../services/googleMailService");
const jwt = require("jsonwebtoken"); //jwt for user stay logged in
const { OAuth2Client } = require("google-auth-library");
const jwtHandling = require("../services/jwt");

const client = new OAuth2Client(
  "1072432309097-3npmrqi8dk2fm3eho7q54h9tn3ulfnku.apps.googleusercontent.com"
);

class UserController {
  //fonction asynchrone signup
  async signup(req, res) {
    try {
      const { firstName, lastName, phoneNumber, email, password } = req.body; //retreiving attributes from request's body
      const validationResult = await validate({
        firstName,
        lastName,
        phoneNumber,
        email,
        password,
      });
      if (validationResult.success === false) {
        return res.status(StatusCodes.BAD_REQUEST).json(validationResult.msg);
      }

      // console.log(req)
      const exist = await userDao.findUserByEmail(email); //exist contient le resultat de la fonction finduserbyemail
      const phoneNumberexists = await userDao.findUserByPhoneNumber(
        phoneNumber
      ); //phoneNumberexists contient le resultat de la fonction finduserbyphonenumber
      //condition sur email et phonenumber
      if (exist.data && phoneNumberexists.data) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json("This email and this phone number are already in use");
      }
      //condition sur email
      if (exist.success === false) {
        return res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json("Error during account creation"); //probleme dans le serveur
      }
      if (exist.data) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json("This email is already in use"); //email utilisé
      }
      //condition sur phone number
      if (phoneNumberexists.success === false) {
        return res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json("Error during account creation"); //probleme dans le serveur
      }
      if (phoneNumberexists.data) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json("This phone number is already in use"); //numero utilisé
      }

      const passwordProcess = await passwordService.encryption(password);
      if (passwordProcess.success === false) {
        return res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json("error during account creation");
      }
      const role = await roleDao.getRoleByName("client");
      if (role.success === false) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json("error ");
      }
      if (!role.data) {
        return res.status(StatusCodes.NOT_FOUND).json("error");
      }
      //enregistrement user dans la base
      const user = new userModel({
        firstName,
        lastName,
        phoneNumber,
        email,
        password: passwordProcess.data,
        roleId: role.data._id,
      });
      await user.save();
      const mail = sendMail(email);

      return res
        .status(StatusCodes.CREATED)
        .json("account created successfully");
    } catch (error) {
      console.log(error);
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json("error during account creation, please try again later");
    }
  }
  //la fonction asynchrone signin
  async signin(req, res) {
    try {
      const { email, password } = req.body;
      const userexists = await userDao.findUserByEmail(email);
      if (userexists.success === false) {
        return res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json("Error during Sing in");
      }
      if (userexists.data == null) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json("Please check your email");
      }
      const decryptedPaswword = await passwordService.decryption(
        userexists.data.password,
        password
      );
      if (decryptedPaswword.success === false) {
        return res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json("Error during Sing in");
      }
      if (!decryptedPaswword.data) {
        return res.status(StatusCodes.FORBIDDEN).json("Wrong Password");
      }
      const jwtProcess = await jwtHandling.jwtSign(
        userexists.data.email,
        userexists.data._id,
        userexists.data.roleId
      );
      if (jwtProcess.success === false) {
        return res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json("Error during the signing in, please try again later");
      }
      //  return res.status(StatusCodes.OK).json(`Welcome ${userexists.data.firstName} ${userexists.data.lastName}`)
      return res.json(jwtProcess.data);
    } catch (error) {
      console.log(error);
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json("Error during signing, please try again later");
    }
  }
  //affichage de uploaded files (json format)
  async getAllFilesForOneUser(req, res) {
    try {
      const userId =
        req.infos.role == "admin" ? req.params.userId : req.infos.authId;
      console.log("**************", userId);
      const userExists = await userDao.findUserById(userId);
      if (userExists.success === false) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json("error");
      }
      if (!userExists.data) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json("no user found with this id");
      }

      return res.status(StatusCodes.OK).json(userExists.data.uploadedFiles);
    } catch (error) {
      console.log(error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json("error");
    }
  }

  async userslist(req, res, next) {
    try {
      const users = await userModel.find().populate("roleId").exec();
      if (!users) {
        return res.status(StatusCodes.NOT_FOUND).json("Users not Found");
      }
      return res.status(StatusCodes.OK).json(users);
    } catch (error) {
      console.log(error);

      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json("Error");
    }
  }
  async deleteuser(req, res, next) {
    const userId = req.infos.role == "admin" ? req.params.id : req.infos.authId;
    userModel.findByIdAndRemove(userId, (error, data) => {
      if (error) {
        return next(error);
      } else {
        res.status(200).json({
          msg: data,
        });
      }
    });
  }
  async deleteprofile(req, res, next) {
    const userId = req.infos.role == "admin" ? req.params.id : req.infos.authId;
    //const userId = req.params.id;
    userModel.findByIdAndRemove(userId, (error, data) => {
      if (error) {
        return error;
      } else {
        res.status(200).json({
          msg: data,
        });
      }
    });
  }
  async updateuser(req, res, next) {
    const { firstName, lastName, phoneNumber, email } = req.body; //retreiving attributes from request's body
    const userId = req.infos.role == "admin" ? req.params.id : req.infos.authId;
    const validationResultWithoutPassword = await validateWitoutPassword({
      firstName,
      lastName,
      phoneNumber,
      email,
    });
    if (validationResultWithoutPassword.success === false) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json(validationResultWithoutPassword.msg);
    }
    userModel.findByIdAndUpdate(
      userId,
      {
        $set: req.body,
      },
      (error, data) => {
        if (error) {
          console.log(error);
          if (error.codeName === "DuplicateKey") {
            return res
              .status(StatusCodes.BAD_REQUEST)
              .json("Email or phone number is already in use");
          }
          return res.status(StatusCodes.BAD_REQUEST).json("Please try again");
        } else {
          return res.status(StatusCodes.OK).json(data);
        }
      }
    );
  }

  async getUsersById(req, res) {
    try {
      const userId = req.params.userId;
      const usersById = await userDao.findUserById(userId);
      if (usersById.success === false) {
        return res.status(StatusCodes.BAD_REQUEST).json("Can not get users ");
      }
      if (!usersById.data) {
        return res.status(StatusCodes.NOT_FOUND).json("User not found");
      }

      return res.status(StatusCodes.OK).json(usersById.data);
    } catch (error) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json("Error..please try again");
    }
  }
  async getProfilInfo(req, res) {
    try {
      const userId = req.infos.authId;
      const usersById = await userDao.findUserById(userId);
      if (usersById.success === false) {
        return res.status(StatusCodes.BAD_REQUEST).json("can not get users");
      }
      if (!usersById.data) {
        return res.status(StatusCodes.NOT_FOUND).json("user not found");
      }

      return res.status(StatusCodes.OK).json(usersById.data);
    } catch (error) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json("error..please try again");
    }
  }
  async googlesignin(req, res) {
    const role = await roleDao.getRoleByName("client");

    if (role.success === false) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json("error ");
    }
    if (!role.data) {
      return res.status(StatusCodes.NOT_FOUND).json("error");
    }
    const { tokenId } = req.body;
    console.log(req);
    client
      .verifyIdToken({
        idToken: tokenId,
        audience:
          "1072432309097-3npmrqi8dk2fm3eho7q54h9tn3ulfnku.apps.googleusercontent.com",
      })
      .then((response) => {
        const { email_verified, name, email } = response.payload;
        console.log(response.payload);

        if (email_verified) {
          userModel.findOne({ email }).exec((err, user) => {
            if (err) {
              return res.status(400).json({
                error: "Something went wrong ...",
              });
            } else {
              if (user) {
                const token = jwt.sign({ _id: user._id }, "test", {
                  expiresIn: "4h",
                });
                const { _id, name, email } = user;

                res.json({
                  token,
                  user: { _id, name, email },
                });
              } else {
                let password = email;
                let newUser = new userModel({
                  name,
                  email,
                  password,
                  roleId: role.data._id,
                });

                newUser.save((err, data) => {
                  if (err) {
                    return res.status(400).json({
                      error: "Something went wrong... in creating user",
                    });
                  }
                  const token = jwt.sign({ _id: data._id }, "test", {
                    expiresIn: "4h",
                  });

                  const { _id, name, email, roleId } = newUser;
                  const mail2 = sendMail2(email);

                  res.json({
                    token,
                    user: { _id, name, email, roleId },
                  });
                });
              }
            }
          });
        }
      });
  }
}
module.exports = new UserController();
