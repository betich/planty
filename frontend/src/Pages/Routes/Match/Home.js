import axios from 'axios';
import React from 'react';
import { Button, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import ViewProject from './Project';
import FormProject from './Form';

const ProjectCard = (props) => {
    const Project = props.project;
    const Owner = Project.owner;
    const Workers = Project.workers;
    
    return (
        <Card
            bg="lightbrown"
            text="black"
            id="projectcard"
            className="mb-2"
            >
            <Card.Body>
                <Card.Title>{Project.name}</Card.Title>
                <Card.Text>by {Owner.username}</Card.Text>
                <Card.Text>{Project.description}</Card.Text>
                <Card.Text>employees: { Workers.map((e) => e.username).join(', ') }</Card.Text>
                <Card.Text>tags:</Card.Text>
                <Card.Text>
                {Project.tags.map((elem, i) => (
                    <Button
                        key={i}
                        variant="outline-danger"
                        className="button-group"
                    >
                        {elem}
                    </Button>
                ))}
                </Card.Text>
                <Button variant="outline-info" onClick={props.viewProject} type="submit">
                    View
                </Button>
            </Card.Body>
        </Card>
    );
}

class Match extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            loaded: false,
            error: null,
            clickable: false,
            Project: null,
            page: "index"
        }

        this.handleNextClick = this.handleNextClick.bind(this);
        this.changeToForm = this.changeToForm.bind(this);
        this.getRandomProject = this.getRandomProject.bind(this);
        this.handleError = this.handleError.bind(this);
        this.changeToView = this.changeToView.bind(this);
        this.changeToIndex = this.changeToIndex.bind(this);
        this.onFormSubmit = this.onFormSubmit.bind(this);
    }

    handleError(err) {
        if (err.response) {
            this.setState({ error: "Internal server error" });
        } else {
            this.setState({ error: "An unknown error occured" });
        }
        window.flash('An error occured', 'error');
        console.error(err);
    }

    getRandomProject() {
        axios.get("/app/match")
            .then((res) => {
                switch (res.status) {
                    case 200:
                        this.setState({ Project: res.data })
                        break;
                    case 204:
                        this.setState({ error: "There are no projects left to display" });
                        break;
                    default:
                        this.getRandomProject();
                }
            })
            .catch((err) => this.handleError(err))
            .finally(() => {
                this.setState({ clickable: true, loaded: true});
            });
    }

    handleNextClick(e) {
        this.setState({ clickable: false}, () => {
            this.getRandomProject();
        });
    }

    componentDidMount() {
        this.getRandomProject();
    }
    
    changeToForm(e) {
        this.setState({ clickable: false}, () => {
            axios.get(`/app/match/questions/${this.state.Project._id}`)
                .then((res) => {
                    switch (res.status) {
                        case 200:
                            this.setState({ page: 'index', Project: null })
                            this.getRandomProject();
                            break;
                        case 202:
                            this.setState({ page: 'form', questions: res.data });
                            break;
                        default:
                            this.getRandomProject();
                    }
                })
                .catch((err) => this.handleError(err))
                .finally(() => {
                    this.setState({ clickable: true, loaded: true});
                });
        });
    }

    changeToView() {
        this.setState({ page: 'view' });
    }

    changeToIndex() {
        this.setState({ page: 'index' });
    }

    onFormSubmit() {
        this.setState({ page: 'index', Project: null })
        this.getRandomProject();
    }

    render() {
        const errorMessage = () => {
            if (this.state.error) {
                let error = (typeof this.state.error === 'object' && this.state.error !== null)
                    ? JSON.stringify(this.state.error)
                    : this.state.error
                
                return (<span>{error}</span>);
            } else {
                return (<></>);
            }
        }

        const renderComponents = () => {
            const MatchApp = () => {
                switch (this.state.page) {
                    case "index":
                        return (
                            <>
                                <h1>Match</h1>
                                <Button variant="outline-success" onClick={this.changeToForm} disabled={!this.state.clickable} className="mr-2">
                                    {this.state.clickable ? "Request To Join" : "loading..."}
                                </Button>
                                <Button variant="outline-danger" onClick={this.handleNextClick} disabled={!this.state.clickable}>
                                    {this.state.clickable ? "Next" : "loading..."}
                                </Button>
                                <hr />
                                <ProjectCard project={this.state.Project} viewProject={this.changeToView} />
                            </>
                        )
                    case "view":
                        return (
                            <>
                                <Link to="#" onClick={this.changeToIndex}>
                                    <Button variant="outline-secondary" disabled={!this.state.clickable} className="button-group">back</Button>
                                </Link>
                                <Button variant="outline-success" onClick={this.changeToForm} disabled={!this.state.clickable} className="button-group">
                                    {this.state.clickable ? "Request To Join" : "loading..."}
                                </Button>
                                <Button variant="outline-danger" onClick={this.handleNextClick} disabled={!this.state.clickable} className="button-group">
                                    {this.state.clickable ? "Next" : "loading..."}
                                </Button>
                                <hr />
                                <ViewProject project={this.state.Project} handleNext={this.handleNextClick} handleAccept={this.handleAcceptClick} />
                            </>
                        );
                    case "form":
                        return (
                            <>
                                <p>
                                    <Link to="#" onClick={this.changeToIndex}>
                                        <Button variant="outline-secondary" disabled={!this.state.clickable} className="button-group">back</Button>
                                    </Link>
                                </p>
                                <FormProject onSubmit={this.onFormSubmit} project={this.state.Project} />
                            </>
                        );
                    default:
                        return (
                            <>
                                <span>can't find the page you're looking for</span>
                            </>
                        )
                }

            }

            if (this.state.loaded) {
                if (this.state.Project) return (<> { MatchApp() } </>);
            } else {
                return (<span>loading...</span>)
            }
        }

        return (
            <>
                { errorMessage() }
                { renderComponents() }
            </>
        );
    }
}

export default Match;