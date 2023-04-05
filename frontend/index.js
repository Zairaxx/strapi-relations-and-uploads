let identifier = document.querySelector("#identifier");
let password = document.querySelector("#password");
let loginBtn = document.querySelector("#login");
let petList = document.querySelector("#petList");
let petName = document.querySelector("#petName");
let petImage = document.querySelector("#petImage");

let login = async () => {
  let response = await axios.post("http://localhost:1337/api/auth/local", {
    identifier: identifier.value,
    password: password.value,
  });
  console.log(response);
  sessionStorage.setItem("token", response.data.jwt);
  sessionStorage.setItem("loginId", response.data.user.id);
  renderPage();
};

let renderPage = async () => {
  if (sessionStorage.getItem("token")) {
    let response = await axios.get(
      "http://localhost:1337/api/users/me?populate=deep,3",
      {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      }
    );
    console.log(response.data);
    response.data.pets.forEach((pet) => {
      petList.innerHTML += `<li>
      <h3>Name:${pet.name}</h3>
      <img src="http://localhost:1337${pet.image?.url}" height="100" />
      </li>`;
    });
  }
};

let addPet = async () => {

  //1. Ladda upp bild
  let imgFile = petImage.files;
  let formData = new FormData();
  formData.append("files", imgFile[0]);

  await axios
    .post("http://localhost:1337/api/upload", formData, {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    })
    .then((response) => {
      //2. Skapa Pet och koppla bilden samt användare till den.
      axios.post(
        "http://localhost:1337/api/pets",
        {
          data: {
            name: petName.value,
            user: sessionStorage.getItem("loginId"),
            image: response.data[0].id,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      );
    });
};

document.querySelector("#addPet").addEventListener("click", addPet);
loginBtn.addEventListener("click", login);

renderPage();
