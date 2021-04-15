import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import Moment from 'react-moment';

import { fetchGeneration } from '../../redux/actions/generationActions';
import './styles.css';

import NewDragon from '../NewDragon/index';

const Generation = ({ generation, fetchGeneration }) => {
    useEffect(() => {
        const interval = setInterval(() => fetchGeneration(), 1000);
        return () => clearInterval(interval);
    }, [fetchGeneration]);

    return (
        <div className='generation-container'>
            {
                (generation.errorMessage) ?
                    <div>{generation.errorMessage}</div>
                    :
                    <div className='generation-content'>
                        <div className='generation-info-container'>
                            <div className='generation-info'>
                                <h5>Current Generation: {generation.content.generationId}</h5>
                                <h5>Time now: <Moment format="YYYY/MM/DD hh:mm:ss">{new Date().toString()}</Moment></h5>
                                <h5>Next Generation: <Moment format="YYYY/MM/DD hh:mm:ss">{new Date(generation.content.expiration).toString()}</Moment></h5>
                            </div>
                        </div>
                        <div className='generation-dragon-container'>
                            <NewDragon />
                        </div>
                    </div>
            }
        </div>
    )
}

const mapStateToProps = state => {
    return {
        generation: state.generation
    }
}

const mapDispatchToProps = dispatch => {
    return {
        fetchGeneration: () => dispatch(fetchGeneration)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Generation);