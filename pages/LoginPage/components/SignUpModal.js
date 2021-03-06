import React, { useContext, useRef, useState } from "react";
import {
  Image,
  ImagePickerIOS,
  Text,
  TextInput,
  TouchableHighlight,
  TouchableOpacity,
  View,
} from "react-native";
import { GlobalContext } from "../../../context/GlobalContext";
import { styles } from "../index";
import userDefaultImage from "../../../assets/images/user-default-image.png";
import { firestore, auth, storage } from "../../../firebase/firebaseContext";
import * as ImagePicker from 'expo-image-picker'

export default function LoginModal() {
  const refContainer = useRef("");
  const [globalState, setGlobalState] = useContext(GlobalContext);

  const [checking, setChecking] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [imageFile, setImageFile] = useState(
    "../../../assets/images/user-default-image.png"
  );
  const [userImagePreview, setUserImagePreview] = useState(
    
  );
  const [inputFieldValues, setInputFieldValues] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  function handlePress() {
    checkInputFields();
  }

  function checkInputFields() {
    const MIN_LENGTH = 6;
    for (let prop in inputFieldValues) {
      if (inputFieldValues[prop].length === 0) {
        setErrorMsg(`Por favor, preencha o campo: ${prop}`);
        return;
      }

      if (inputFieldValues[prop].length > 20 && prop !== "email") {
        setErrorMsg(`${prop} deve ter no máximo 20 caracteres `);
        return;
      }

      if (inputFieldValues[prop].length < MIN_LENGTH) {
        setErrorMsg(`${prop} deve ter no mínimo 6 caracteres `);
        return;
      }

      if (inputFieldValues.password !== inputFieldValues.confirmPassword) {
        setErrorMsg("Senhas são diferentes");
        return;
      }

      signUpUser();
    }
  }

  function signUpUser() {
    const { email, password } = inputFieldValues;
    auth
      .createUserWithEmailAndPassword(email, password)
      .then(() => {
        uploadImageFile();
        createUserReferences();

        setTimeOut(()=> {
          setGlobalState((globalState) => {
            return {
              ...globalState,
              user: { ...globalState.user, isLoggedIn: true },
            };
          });
        }, 2000)
      })
      .catch((err) => {
        setTimeout(() => {
          let msg;
          switch (err.code) {
            case "auth/email-already-in-use":
              msg = "Email já pertence a uma conta existente";
              break;
            case "auth/invalid-email":
              msg = "Email mal formatado";
              break;
            case "auth/weak-password":
              msg = "A senha deve conter no mínimo 6 caracteres";
          }
          setErrorMsg(msg ? msg : err.message);
        }, 1000);
      });

      async function uploadImageFile() {
        if(userImagePreview) {
          const response = await fetch(userImagePreview);
          const blob = await response.blob();

          storage
            .ref(`users/${auth.currentUser.uid}/profileImage`)
            .put(blob)
            .then((output) => console.log("OUTPUT STATE: " + output.state));
        } else {
          
        }
        
      }

    function createUserReferences() {
      const { username } = inputFieldValues;
      firestore.collection("users").doc(auth.currentUser.uid).set({
        username,
        bio: "",
        points: 0,
        pasType: 1,
        achivs: [],
        following: [],
        subjects: [],
        notifications: [],
        pendingNotifications: false,
        privateInfo: false,
        hasImage: userImagePreview? true : false
      });
    }
  }

  async function openImagePicker() {
    console.log('try to open picker')
    const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();
    const errerMsg = 'Não foi possível acessar suas fotos'

    if (status === "granted" || status === 'undetermined') {
      let result;
      try {result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });}
      catch(err) {
        console.log(err)
        setErrorMsg(errorMsg)
      }

      if (!result.cancelled) setUserImagePreview(result.uri);

    } else {
      ImagePicker.getMediaLibraryPermissionsAsync();
      setErrorMsg(errorMsg)
    }
  }

  return (
    <>
      <View>
        <TouchableOpacity
          onPress={() => {
            openImagePicker();
          }}
        >
          <Image
            style={{
              width: 120,
              height: 120,
              alignSelf: "center",
              marginBottom: 20,
              borderRadius: 120
            }}
            source={
              userImagePreview
                ? {uri: userImagePreview}
                : require("../../../assets/images/user-default-image.png")
            }
          />
        </TouchableOpacity>
        <TextInput
          onChangeText={(text) =>
            setInputFieldValues((values) => {
              return { ...values, username: text };
            })
          }
          value={inputFieldValues.username}
          style={styles["input"]}
          placeholder="Username..."
        />
        <TextInput
          onChangeText={(text) =>
            setInputFieldValues((values) => {
              return { ...values, email: text };
            })
          }
          value={inputFieldValues.email}
          style={styles["input"]}
          placeholder="Email..."
        />
        <TextInput
          onChangeText={(text) =>
            setInputFieldValues((values) => {
              return { ...values, password: text };
            })
          }
          value={inputFieldValues.password}
          style={styles["input"]}
          placeholder="Senha..."
        />
        <TextInput
          onChangeText={(text) =>
            setInputFieldValues((values) => {
              return { ...values, confirmPassword: text };
            })
          }
          value={inputFieldValues.confirmPassword}
          style={styles["input"]}
          placeholder="Confirmar senha"
        />
      </View>
      <Text style={styles["errorMsg"]}>{errorMsg}</Text>
      <TouchableOpacity onPress={handlePress}>
        <View style={styles["btnContainer"]}>
          <Text style={styles["btn"]}>Criar conta</Text>
        </View>
      </TouchableOpacity>
    </>
  );
}
