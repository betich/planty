import axios from 'axios';
import React from 'react';
import { Form, Button } from 'react-bootstrap';
import validate from "../../../Services/Validate";
import Error from "../../../Components/Error";
import ProjectForm from "../../../Components/Form/Project";

class Create extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: {},
            errors: {}
        }

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
    }

    handleInputChange(formData) {
        this.setState({ data: formData });
    }

    async handleSubmit(e) {
        e.preventDefault();
        const data = this.state.data;

        let { valid, invalidData } = validate(data);

        if (valid) {
            const options = {
                headers: {'Content-Type': 'application/json' }
            };
            
            axios.post('/app/projects', data, options)
                .then((res) => {
                    if (res.status === 200) {
                        window.flash(`Created ${res.data.name}`, 'success');
                        this.props.history.push(
                            `/projects/${res.data.owner.username}/${res.data.url}`
                        );
                    }
                })
                .catch((err) => {
                    switch (err.response.status) {
                        case 409:
                            this.setState({ errors: {projectname: ['project name taken']}});
                            break;
                        default:
                            window.flash('An error occured', 'error');
                            console.error(err);
                    }
                });
        } else {
            this.setState({ errors: invalidData });
        }
    }

    render() {
        return (
            <>
                <h1>Create a Project</h1>
                <Form onSubmit={this.handleSubmit} noValidate>
                    <ProjectForm inputChange={this.handleInputChange} />
                    <Error errors={this.state.errors} />

                    <Button variant="info" type="submit">
                        Create
                    </Button>
                </Form>
            </>
        );
    }
}

export default Create;
