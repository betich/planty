import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, Button, Form } from "react-bootstrap";
import { Link, useHistory } from "react-router-dom";
import Loading from "../../../Components/Loading";

const DeleteSection = (props) => {
    const history = useHistory();
    const [show, setShow] = useState(false);
    const [disable, setDisable] = useState(false);
    const [confirmed, setConfirmed] = useState(false);

    const handleClick = async (e) => {
        if (confirmed === false) {
            setShow(true);
            setDisable(true);
        } else {
            try {
                axios.delete(`/app/projects/${props.id}`)
                .then(response => {
                    if (response.status === 200) {
                        history.push("/projects");
                    }
                })
            } catch (err) {
                console.error(err);
            }
        }
    };

    const handleChange = (e) => {
        if ( e.target.value === props.confirmationText)
        {
            setDisable(false);
            setConfirmed(true);
        } else {
            setDisable(true);
            setConfirmed(false);
        }
    }
    return (
        <div>
            <Button onClick={handleClick} disabled={disable}>Delete</Button>
            {show ? (
                <div>
                    <Form.Group className="mb-3" controlId="education">
                        <Form.Label>Enter project's name and hit Delete again</Form.Label>
                        <Form.Control onChange={handleChange} name="confirmationtext"></Form.Control>
                    </Form.Group>
                </div>
            ) : (
                <></>
            )}
        </div>
    );
};

const View = (props) => {
    const [Project, setProject] = useState({});
    const [loaded, setLoad] = useState(false);

    useEffect(() => {
        axios
            .get(`/app/projects/${props.match.params.id}`)
            .then((res) => res.data)
            .then((project) => {
                setProject(project);
            })
            .then(() => setLoad(true))
            .catch((err) => {
                console.error("oh no", err);
                setLoad(true);
            });
    }, [props.match.params.id]);

    return (
        <>
            {!loaded ? (
                <Loading />
            ) : Object.keys(Project).length === 0 &&
              Project.constructor === Object ? (
                <span>Can't find the Project lol</span>
            ) : (
                <>
                    <Link to="/projects">Back</Link>
                    <Card
                        bg="white"
                        text="black"
                        style={{ width: "18rem" }}
                        className="mb-2"
                    >
                        <Card.Header>Project</Card.Header>
                        <Card.Body>
                            <Card.Title>{Project.name}</Card.Title>
                            <Card.Text>{Project.description}</Card.Text>
                        </Card.Body>
                    </Card>
                    <DeleteSection id={props.match.params.id} confirmationText={Project.name} />
                </>
            )}
        </>
    );
};

export default View;
