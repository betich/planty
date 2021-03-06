import { Alert } from 'react-bootstrap';

/* ==============================================================
    <Error errors=Object />
    Displays errors
    
=================================================================== */

const Error = (props) => {
    let ErrorMessages = (Object.keys(props.errors).length === 0 && props.errors.constructor === Object)
        ? ''
        : Object.entries(props.errors)
        .map(([key, name], i) => {
            return (
                <p key={i}>
                    <p className="type">{key}</p>
                    <p className="msg">{name.join(',\n')}</p>
                </p>
            )
        });
    
    return (
        <>
        { (ErrorMessages !== '')
            ? (
                <Alert variant='danger'>
                    <pre>{ErrorMessages}</pre>
                </Alert>
            ) : (
            <></>
        )}
        </>
    );
};

export default Error;