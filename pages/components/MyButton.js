
const MyButton = () => {

    const clickk = async () => {
        console.log("Clickk");
    }

    return <button className="btn btn-primary" onClick={clickk}>Click</button>
}

export default MyButton;